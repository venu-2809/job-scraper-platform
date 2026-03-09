import requests
from bs4 import BeautifulSoup
from typing import List
from urllib.parse import urljoin

def scrape_internshala(keyword: str, location: str | None = None) -> List[dict]:
    jobs = []
    search_query = keyword.replace(' ', '-')
    loc_query = location.replace(' ', '-') if location else ""
    base_url = "https://internshala.com"
    # If location is provided, use both keyword and location; otherwise, only keyword.
    if location:
        url = f"{base_url}/internships/keywords-{search_query}-location-{loc_query}/"
    else:
        url = f"{base_url}/internships/keywords-{search_query}/"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            listings = soup.find_all('div', class_='individual_internship')
            for item in listings[:5]:
                # Internshala tends to keep job titles inside an h3 with this class,
                # but we add extra fallbacks in case the structure shifts.
                title_elem = item.find('h3', class_='heading_4_5')
                company_elem = item.find('div', class_='heading_6')
                loc_elem = item.find('a', class_='location_link')

                title = None
                if title_elem:
                    title = title_elem.get_text(strip=True)

                    # Some variants keep the anchor text more accurate than the h3 wrapper.
                    anchor_in_title = title_elem.find('a')
                    if anchor_in_title and anchor_in_title.get_text(strip=True):
                        title = anchor_in_title.get_text(strip=True)

                # Fallback: any anchor in the card that looks like a job link.
                if not title:
                    detail_anchor = item.find('a', href=True)
                    if detail_anchor:
                        # Prefer visible text, but fall back to title/aria-label attributes.
                        candidate = detail_anchor.get_text(strip=True)
                        if not candidate:
                            candidate = detail_anchor.get('title') or detail_anchor.get('aria-label')
                        if candidate:
                            title = candidate.strip()

                if not title:
                    title = "Unknown Title"
                company = company_elem.text.strip() if company_elem else "Unknown Company"
                loc = loc_elem.text.strip() if loc_elem else location

                # If user specified a location, keep only listings that mention it
                # in the location text to avoid unrelated "multiple locations" jobs.
                if location:
                    loc_lower = loc.lower()
                    search_loc_lower = location.lower()
                    if search_loc_lower not in loc_lower:
                        # Skip jobs that don't match the requested location.
                        continue

                # Extract the job link from the title's anchor, as that's the detail page.
                link = None
                if title_elem:
                    title_anchor = title_elem.find('a', href=True)
                    if title_anchor:
                        raw_href = title_anchor.get('href', '').strip()
                        link = urljoin(base_url, raw_href)

                if not link:
                    # Fallback: any anchor in the card that looks like a job link.
                    detail_anchor = item.find('a', href=True)
                    if detail_anchor:
                        raw_href = detail_anchor.get('href', '').strip()
                        if raw_href and not raw_href.startswith('#'):  # Avoid anchor links
                            link = urljoin(base_url, raw_href)

                if not link:
                    # Skip if no valid link found
                    continue

                jobs.append({
                    "title": title,
                    "company": company,
                    "location": loc,
                    "platform": "Internshala",
                    "job_link": link
                })
    except Exception as e:
        print("Scrape error (Internshala):", e)
    return jobs

def scrape_unstop(keyword: str, location: str | None = None) -> List[dict]:
    """
    Disabled placeholder for Unstop.
    Unstop currently relies on heavy client-side rendering and cookie gating,
    which makes reliable scraping (and deep-linking to individual jobs) brittle
    for this assessment. We return an empty list to avoid surfacing misleading
    or non-functional links.
    """
    return []


def scrape_jobs(keyword: str, location: str | None = None) -> List[dict]:
    # Keyword is mandatory, location is optional.
    jobs: List[dict] = []
    jobs.extend(scrape_internshala(keyword, location))
    jobs.extend(scrape_unstop(keyword, location))
    jobs.extend(scrape_nextgen(keyword, location))
    jobs.extend(scrape_placement_officer(keyword, location))
    
    # Deduplicate jobs based on title and job_link
    seen = set()
    unique_jobs = []
    for job in jobs:
        key = (job['title'], job['job_link'])
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)
    
    return unique_jobs


def _title_matches_keyword(title: str, keyword: str) -> bool:
    return keyword.lower() in title.lower()


def scrape_nextgen(keyword: str, location: str | None = None) -> List[dict]:
    """
    Scrape NextGenCareersHub latest jobs and internships.
    We:
      - Hit the homepage (which lists recent jobs).
      - Extract job cards from the Jobs Zone / Internships sections.
      - Filter by keyword presence in the title (case-insensitive).
    Location is currently best-effort and often not explicitly listed; we
    default to the user-provided location or 'Not specified'.
    """
    base_url = "https://nextgencareershub.in"
    url = base_url + "/"
    headers = {"User-Agent": "Mozilla/5.0"}
    jobs: List[dict] = []

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return jobs

        soup = BeautifulSoup(response.text, "html.parser")

        # Posts are generally listed as article or div entries with an anchor title.
        for anchor in soup.find_all("a", href=True):
            title = anchor.get_text(strip=True)
            if not title:
                continue

            # Only keep posts from the Jobs/Internships sections by simple keyword heuristic.
            if not _title_matches_keyword(title, keyword):
                continue

            href = anchor["href"].strip()
            link = urljoin(base_url, href)

            loc_value = location or "Not specified"

            jobs.append(
                {
                    "title": title,
                    "company": "Unknown Company",
                    "location": loc_value,
                    "platform": "NextGenCareersHub",
                    "job_link": link,
                }
            )

            if len(jobs) >= 5:
                break

    except Exception as e:
        print("Scrape error (NextGenCareersHub):", e)

    return jobs


def scrape_placement_officer(keyword: str, location: str | None = None) -> List[dict]:
    """
    Scrape Placement Officer homepage for recent posts.
    We:
      - Hit the homepage.
      - Extract post titles with anchors.
      - Filter posts where the title contains the keyword.
      - Best-effort extraction of location from patterns like 'in Pune', 'in Bangalore'.
    """
    import re

    base_url = "https://www.placement-officer.com"
    url = base_url + "/"
    headers = {"User-Agent": "Mozilla/5.0"}
    jobs: List[dict] = []

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return jobs

        soup = BeautifulSoup(response.text, "html.parser")

        for anchor in soup.find_all("a", href=True):
            title = anchor.get_text(strip=True)
            if not title:
                continue

            if not _title_matches_keyword(title, keyword):
                continue

            href = anchor["href"].strip()
            link = urljoin(base_url, href)

            # Try to infer location from title text (e.g., 'Hiring in Pune').
            loc_value = location or "Not specified"
            match = re.search(r"in\s+([A-Za-z\s]+)", title)
            if match:
                inferred = match.group(1).strip()
                if inferred:
                    loc_value = inferred

            jobs.append(
                {
                    "title": title,
                    "company": "Unknown Company",
                    "location": loc_value,
                    "platform": "Placement Officer",
                    "job_link": link,
                }
            )

            if len(jobs) >= 5:
                break

    except Exception as e:
        print("Scrape error (Placement Officer):", e)

    return jobs
