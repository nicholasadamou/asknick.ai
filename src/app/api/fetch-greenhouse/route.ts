import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate Greenhouse URL
    if (!url.includes("greenhouse.io")) {
      return NextResponse.json(
        { error: "Please provide a valid Greenhouse job URL" },
        { status: 400 }
      );
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch job listing" },
        { status: response.status }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let jobDescription = "";
    let jobTitle = "";
    let company = "";
    let location = "";

    // Extract job title - Greenhouse uses specific selectors
    jobTitle = $('h1.app-title').text().trim() ||
               $('.opening h1').text().trim() ||
               $('h1').first().text().trim();

    // Extract company name - usually in the header or title
    company = $('.company-name').text().trim() ||
              $('header .company-name').text().trim();
    
    // If company not found, try to extract from URL
    if (!company) {
      const urlMatch = url.match(/job-boards\.greenhouse\.io\/([^/]+)/);
      if (urlMatch) {
        company = urlMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      }
    }

    // Extract location
    location = $('.location').text().trim() ||
               $('[data-test="location"]').text().trim() ||
               $('.opening .location').text().trim();

    // Extract job description - Greenhouse typically uses these selectors
    const descriptionContainer = $('#content').html() ||
                                 $('.content').html() ||
                                 $('#main').html() ||
                                 $('main').html() ||
                                 $('.opening').html();

    if (descriptionContainer) {
      // Parse the HTML and extract text content
      const $desc = cheerio.load(descriptionContainer);
      
      // Remove script and style tags
      $desc('script, style').remove();
      
      // Get text content and clean it up
      jobDescription = $desc.text()
        .replace(/\s+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    if (!jobDescription && !jobTitle) {
      return NextResponse.json(
        { error: "Could not extract job information. The page structure may have changed or the URL may be invalid." },
        { status: 404 }
      );
    }

    // Format the response
    const formattedDescription = [
      jobTitle && `Job Title: ${jobTitle}`,
      company && `Company: ${company}`,
      location && `Location: ${location}`,
      "",
      "Job Description:",
      jobDescription || "No description available",
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({
      jobDescription: formattedDescription,
      jobTitle,
      company,
      location,
    });
  } catch (error) {
    console.error("Error fetching Greenhouse listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch job description" },
      { status: 500 }
    );
  }
}
