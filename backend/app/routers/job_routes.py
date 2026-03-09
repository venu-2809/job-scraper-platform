from fastapi import APIRouter, Depends
from typing import List, Dict
from pydantic import BaseModel
from .. import schemas, models, dependencies
from ..services.scraper_service import scrape_jobs

router = APIRouter(tags=["Jobs"])


class ScrapeRequest(BaseModel):
    keyword: str
    # Location is optional; when omitted, we use keyword-only search.
    location: str | None = None


class ScrapedJobOut(BaseModel):
    title: str
    company: str
    location: str
    platform: str
    job_link: str


@router.post("/scrape-jobs", response_model=List[ScrapedJobOut])
def api_scrape_jobs(
    request: ScrapeRequest, current_user: models.User = Depends(dependencies.get_current_user)
):
    jobs = scrape_jobs(request.keyword, request.location)
    return jobs


class ResumeInsightsRequest(BaseModel):
    resume_text: str
    jobs: List[Dict[str, str]]


class ResumeInsightsResponse(BaseModel):
    recommended_keywords: List[str]
    top_job_skills: List[str]


@router.post("/resume-insights", response_model=ResumeInsightsResponse)
def resume_insights(
    payload: ResumeInsightsRequest,
    current_user: models.User = Depends(dependencies.get_current_user),
):
    """
    Simple keyword-based resume insights:
      - Extract frequent terms from job titles and platforms.
      - Compare against words present in the resume.
      - Recommend missing high-frequency terms as keywords.
    """
    import re
    from collections import Counter

    resume_text_lower = payload.resume_text.lower()
    resume_tokens = set(re.findall(r"[a-zA-Z0-9+#.]+", resume_text_lower))

    # Aggregate text from job titles only (exclude platform names to avoid irrelevant keywords).
    job_corpus = []
    for job in payload.jobs:
        title = job.get("title", "") or ""
        job_corpus.append(title)

    corpus_text = " ".join(job_corpus).lower()
    corpus_tokens = re.findall(r"[a-zA-Z0-9+#.]+", corpus_text)

    # Remove extremely generic words and platform-specific terms.
    stopwords = {
        "and",
        "or",
        "the",
        "a",
        "an",
        "for",
        "to",
        "of",
        "in",
        "on",
        "with",
        "at",
        "from",
        "job",
        "internship",
        "intern",
        "developer",
        "engineer",
        "role",
        "junior",
        "senior",
        "hiring",
        "more",
        "read",
        "apply",
        "actively",
        "limited",
        "private",
        "llp",
        "services",
        "solution",
        "consultancy",
        "beqick",
        "fyntune",
        "fincon",
        "tstpes",
        "zycus",
        "cbts",
        "associate",
        "fresher",
        "software",
        "web",
        "backend",
        "automation",
        "focus",
        "framer",
        "shopify",
        "basic",
        "seo",
        "php",
        "ai",
        "webflow",
        "internshala",
        "nextgencareershub",
        "placement",
        "officer",
        "unstop",
        "unknown",
        "company",
        "not",
        "specified",
    }
    filtered_tokens = [t for t in corpus_tokens if t not in stopwords and len(t) > 2]

    freq = Counter(filtered_tokens)
    # Top N skills/keywords present across job titles.
    top_job_skills = [word for word, _ in freq.most_common(20)]

    # Recommend those not already present in resume.
    recommended = [word for word in top_job_skills if word not in resume_tokens]

    return ResumeInsightsResponse(
        recommended_keywords=recommended[:10],
        top_job_skills=top_job_skills[:20],
    )
