import {useState, useEffect, useRef} from "react";
import {Document, Page, pdfjs} from "react-pdf";
import "./App.css";

// Set up PDF.js worker - use local worker file from react-pdf's pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [currentCitation, setCurrentCitation] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const messagesEndRef = useRef(null);

  // Simulated API response data
  const simulatedResponse = {
    answer:
      "Yes, under Section 166 of the Motor Vehicles Act, 1988, the claimants are entitled to an addition for future prospects even when the deceased was self-employed and aged 54–55 years at the time of the accident. In *Dani Devi v. Pritam Singh*, the Court held that **10% of the deceased's annual income** should be added as future prospects.",
    citations: [
      {
        text: "as the age of the deceased at the time of accident was held to be about 54-55 years by the learned Tribunal, being self-employed, as such, 10% of annual income should have been awarded on account of future prospects.",
        source: "Dani_Devi_v_Pritam_Singh.pdf",
        paragraph: "Para 7",
        pdfUrl: "/Dani_Vs_Pritam.pdf",
        highlightText:
          "10% of annual income should have been awarded on account of future prospects",
      },
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: simulatedResponse.answer,
        citations: simulatedResponse.citations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleCitationClick = (citation) => {
    setCurrentCitation(citation);
    setShowPdfModal(true);

    // Try to estimate starting page based on paragraph number
    let startPage = 1;
    if (citation.paragraph) {
      const paraMatch = citation.paragraph.match(/Para\s*(\d+)/i);
      if (paraMatch) {
        const paraNum = parseInt(paraMatch[1]);
        // Rough estimate: assume 2-3 paragraphs per page
        startPage = Math.max(1, Math.floor(paraNum / 2.5));
      }
    }

    setPageNumber(startPage);
    setSearchText(citation.highlightText || citation.text);
    setPdfLoading(true);

    console.log(
      "Opening citation:",
      citation.paragraph,
      "starting from page:",
      startPage
    );
  };

  // PDF event handlers
  const onDocumentLoadSuccess = ({numPages}) => {
    setNumPages(numPages);
    setPdfLoading(false);
    // Start searching for citation text on page 1
    setTimeout(() => {
      searchAndHighlightText();
    }, 1000);
  };

  const onDocumentLoadError = (error) => {
    console.error("Error loading PDF:", error);
    console.error("PDF URL:", currentCitation?.pdfUrl);
    console.error("Full error details:", error.message, error.name);
    setPdfLoading(false);
  };

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  // Search and highlight citation text
  const searchAndHighlightText = () => {
    if (!searchText) return;

    // Wait for text layer to render
    setTimeout(() => {
      const textLayer = document.querySelector(".react-pdf__Page__textContent");
      if (textLayer) {
        // Clear previous highlights
        const previousHighlights = textLayer.querySelectorAll(
          ".citation-highlight"
        );
        previousHighlights.forEach((highlight) => {
          const parent = highlight.parentNode;
          parent.replaceChild(
            document.createTextNode(highlight.textContent),
            highlight
          );
          parent.normalize();
        });

        const spans = textLayer.querySelectorAll("span");
        let found = false;
        let searchTerms = [];
        let paragraphNumber = null;

        // Check if we have a paragraph reference
        if (currentCitation?.paragraph) {
          const paraMatch = currentCitation.paragraph.match(/Para\s*(\d+)/i);
          if (paraMatch) {
            paragraphNumber = paraMatch[1];
            searchTerms.push(
              `${paragraphNumber}.`,
              `Para ${paragraphNumber}`,
              `${paragraphNumber}:`
            );
          }
        }

        // Add content-based search terms
        if (
          searchText.toLowerCase().includes("10%") &&
          searchText.toLowerCase().includes("annual income")
        ) {
          searchTerms.push(
            "10%",
            "annual income",
            "future prospects",
            "self-employed",
            "54-55 years"
          );
        } else {
          // Split search text into meaningful terms (remove common words)
          const commonWords = [
            "the",
            "of",
            "and",
            "or",
            "in",
            "on",
            "at",
            "to",
            "for",
            "with",
            "by",
            "a",
            "an",
            "is",
            "was",
            "are",
            "were",
            "be",
            "been",
            "have",
            "has",
            "had",
          ];
          const contentTerms = searchText
            .toLowerCase()
            .split(/\s+/)
            .filter((term) => term.length > 2 && !commonWords.includes(term))
            .slice(0, 4); // Take first 4 meaningful terms
          searchTerms.push(...contentTerms);
        }

        console.log("Searching for terms:", searchTerms, "on page", pageNumber);

        // Search through all spans for the terms with priority scoring
        let bestMatch = null;
        let bestScore = 0;
        let allMatches = [];

        spans.forEach((span) => {
          const text = span.textContent?.toLowerCase() || "";
          let score = 0;
          let matchingTerms = [];

          // Check for paragraph number matches (highest priority)
          if (paragraphNumber) {
            if (
              text.includes(`${paragraphNumber}.`) ||
              text.includes(`para ${paragraphNumber}`) ||
              text.includes(`${paragraphNumber}:`)
            ) {
              score += 100;
              matchingTerms.push(`Para ${paragraphNumber}`);
            }
          }

          // Check for content matches
          searchTerms.forEach((term) => {
            if (text.includes(term.toLowerCase())) {
              if (term === "10%" || term === "annual income") {
                score += 50; // High priority for key terms
              } else if (term.length > 5) {
                score += 20; // Medium priority for longer terms
              } else {
                score += 10; // Lower priority for short terms
              }
              matchingTerms.push(term);
            }
          });

          if (score > 0) {
            const match = {span, score, matchingTerms, text: span.textContent};
            allMatches.push(match);

            if (score > bestScore) {
              bestScore = score;
              bestMatch = match;
            }
          }
        });

        console.log(
          "All matches found:",
          allMatches.map((m) => ({
            text: m.text.substring(0, 50),
            score: m.score,
            terms: m.matchingTerms,
          }))
        );

        // Highlight all matches, but prioritize the best one
        if (allMatches.length > 0) {
          found = true;

          allMatches.forEach((match, index) => {
            const span = match.span;
            const isBestMatch = match === bestMatch;

            // Highlight the span
            span.style.backgroundColor = isBestMatch
              ? "rgba(255, 215, 0, 0.9)"
              : "rgba(255, 255, 0, 0.7)";
            span.style.padding = "2px 4px";
            span.style.borderRadius = "3px";
            span.style.border = isBestMatch
              ? "2px solid rgba(255, 165, 0, 0.9)"
              : "1px solid rgba(255, 193, 7, 0.8)";
            span.style.boxShadow = isBestMatch
              ? "0 0 10px rgba(255, 165, 0, 0.7)"
              : "0 0 5px rgba(255, 193, 7, 0.5)";
            span.classList.add("citation-highlight");

            if (isBestMatch) {
              span.classList.add("best-match");
            }

            console.log(
              `Match ${index + 1} (score: ${match.score}):`,
              span.textContent.substring(0, 100),
              "terms:",
              match.matchingTerms
            );
          });

          // Scroll to the best match
          if (
            bestMatch &&
            !document.querySelector(".citation-highlight.scrolled-to")
          ) {
            bestMatch.span.classList.add("scrolled-to");
            setTimeout(() => {
              bestMatch.span.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }, 100);
          }
        }

        // If not found on current page and we haven't searched all pages, try next page
        if (!found && pageNumber < numPages) {
          console.log("Text not found on page", pageNumber, "trying next page");
          setTimeout(() => {
            setPageNumber((prev) => prev + 1);
          }, 500);
        } else if (!found && pageNumber >= numPages) {
          console.log(
            "Text not found in entire document, starting from page 1"
          );
          // If we've searched all pages and still not found, start over from page 1
          setPageNumber(1);
        }
      }
    }, 800); // Increased timeout to ensure text layer is fully rendered
  };

  // Function to format text with bold and italic
  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
  };

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Search for citation text when page changes
  useEffect(() => {
    if (showPdfModal && pageNumber > 0 && numPages) {
      setTimeout(() => {
        searchAndHighlightText();
      }, 1000);
    }
  }, [pageNumber, showPdfModal, numPages]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            Lexi Legal Assistant
          </h1>
          <p className="text-sm text-gray-600">
            Ask legal questions and get AI-powered answers with citations
          </p>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Lexi Legal Assistant
              </h3>
              <p className="text-gray-600 mb-4">
                Ask any legal question and get detailed answers with citations
                from legal documents.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Try this example:
                </p>
                <p className="text-sm text-blue-700">
                  "In a motor accident claim where the deceased was
                  self-employed and aged 54–55 years at the time of death, is
                  the claimant entitled to an addition towards future prospects
                  in computing compensation under Section 166 of the Motor
                  Vehicles Act, 1988?"
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-3xl ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200"
                    } rounded-lg px-4 py-3 shadow-sm`}
                  >
                    {message.type === "user" ? (
                      <p className="text-sm">{message.content}</p>
                    ) : (
                      <div>
                        <div className="prose prose-sm max-w-none mb-4">
                          <p
                            className="text-gray-800 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: formatText(message.content),
                            }}
                          />
                        </div>

                        {/* Citations */}
                        {message.citations && message.citations.length > 0 && (
                          <div className="border-t border-gray-100 pt-3">
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                              Citations
                            </h4>
                            {message.citations.map((citation, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-md p-3 mb-2 last:mb-0"
                              >
                                <p className="text-sm text-gray-700 mb-2 italic">
                                  "{citation.text}"
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    ({citation.paragraph} of the document)
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleCitationClick(citation)
                                    }
                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    Open {citation.source}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{animationDelay: "0.1s"}}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{animationDelay: "0.2s"}}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        Analyzing your question...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a legal question... (Press Enter to send, Shift+Enter for new line)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors self-end"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>

      {/* PDF Modal */}
      {showPdfModal && currentCitation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentCitation.source}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentCitation.paragraph} - Citation Reference
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPdfModal(false);
                  setCurrentCitation(null);
                  setSearchText("");
                  setPageNumber(1);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Referenced Text to Highlight:
                </h4>
                <p className="text-yellow-700 italic">
                  "{currentCitation.text}"
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-yellow-600">
                    📍 Searching for: "
                    {currentCitation.highlightText ||
                      currentCitation.text.substring(0, 50)}
                    ..." in {currentCitation.paragraph}
                  </div>
                  <div className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    Page {pageNumber} of {numPages || "?"}
                  </div>
                </div>
              </div>

              {/* PDF Viewer Section */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* PDF Toolbar */}
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      PDF Viewer
                    </span>
                    {numPages && (
                      <span className="text-xs text-gray-500">
                        Page {pageNumber} of {numPages}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        window.open(currentCitation.pdfUrl, "_blank")
                      }
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      title="Open PDF in new tab"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span>Open in New Tab</span>
                    </button>
                    <button
                      onClick={previousPage}
                      disabled={pageNumber <= 1}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                    >
                      Previous
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={pageNumber >= numPages}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* PDF Content Area */}
                <div className="h-96 bg-gray-100 flex items-center justify-center relative">
                  {pdfLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
                        <div
                          className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"
                          style={{animationDelay: "0.1s"}}
                        ></div>
                        <div
                          className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"
                          style={{animationDelay: "0.2s"}}
                        ></div>
                        <span className="ml-2 text-sm text-gray-600">
                          Loading PDF...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actual PDF Viewer */}
                  <div className="w-full h-full flex items-center justify-center">
                    <Document
                      file={currentCitation.pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"
                            style={{animationDelay: "0.1s"}}
                          ></div>
                          <div
                            className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"
                            style={{animationDelay: "0.2s"}}
                          ></div>
                          <span className="ml-2 text-sm text-gray-600">
                            Loading PDF...
                          </span>
                        </div>
                      }
                      error={
                        <div className="text-center p-8">
                          <div className="text-red-500 mb-4">
                            <svg
                              className="w-12 h-12 mx-auto"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            Error Loading PDF
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Unable to load the PDF file. Please try opening it
                            in a new tab.
                          </p>
                          <button
                            onClick={() =>
                              window.open(currentCitation.pdfUrl, "_blank")
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                          >
                            Open in New Tab
                          </button>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        width={600}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    </Document>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
