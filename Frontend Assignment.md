# **Lexi Frontend Assignment – Legal Assistant Interface with Citations ![ref1]**
## **Objective** 
Build a minimal frontend interface for a Lexi-like legal assistant that allows users to: 

1. Ask a legal question 
1. See a generated answer 
1. View one or more citations (from documents) 
1. Click the citation to open the original **PDF** at the relevant place 

This simulates how Lexi helps users trace AI-generated legal answers back to real documents. ![ref1]

**Tech Stack:** React.js (preferred), Tailwind CSS optional but welcome  **API:** Simulated – no real backend needed 

` `**PDF:** Available for simulated citation below ![ref1]
## **Question to Use for Simulation** 
Simulate this example query from a motor accident case: 

**Query:** 

` `*"In a motor accident claim where the deceased was self-employed and aged 54–55 years at the time of death, is the claimant entitled to an addition towards future prospects in computing compensation under Section 166 of the Motor Vehicles Act, 1988? If so, how much?" ![ref1]*
## **Answer to Display** 
**Answer:** 

` `Yes, under Section 166 of the Motor Vehicles Act, 1988, the claimants are entitled to an addition for future prospects even when the deceased was self-employed and aged 54–55 years at the time of the accident. In *Dani Devi v. Pritam Singh*, the Court held that **10% of the deceased’s annual income** should be added as future prospects. ![ref1]
## **Citation to Show** 
**Citation Text (shown below the answer):** 

“as the age of the deceased at the time of accident was held to be about 54-55 years by the learned Tribunal, being self-employed, as such, 10% of annual income should have been awarded on account of future prospects.” (Para 7 of the document)* 

**On Click:** Open this PDF: [Download Judgment PDF ](https://lexisingapore-my.sharepoint.com/:b:/g/personal/harshit_lexi_sg/EdOegeiR_gdBvQxdyW4xE6oBCDgj5E4Bo5wjvhPHpqgIuQ?e=TEu4vz)

**Scroll to and highlight Paragraph 7** !
## **What You Need to Build** 
1. **Input Panel** 
- Text area to enter a legal query 
- Submit button with loading state 
2. **Answer Panel** 
- Show the answer text in a card 
- Below it, show the citation with a source label and clickable link 
3. **Citation Handling** 
- Clicking the citation opens the PDF in a new tab 
- Optional: simulate scroll-to-para or highlight (mock only) 
## **UI Requirements**  
For the UI, please make it similar to a chat interface such as ChatGPT and clicking on the citation should open up the document in a popup. Bonus points if the PDF scrolls to the specific paragraph / highlights the specific text) 

ChatGPT for reference: 

![](image.png)

## **API Logic** 
You don’t need to connect to a real backend. Simulate the POST request like this: 

```js
// On click of Submit
const response = {
  answer: "Yes, under Section 166 of the Motor Vehicles Act, 1988...",
  citations: [
    {
      text: "As the age of the deceased at the time of accident was held to be about 54–55 years...",
      source: "Dani_Devi_v_Pritam_Singh.pdf",
      link: "https://lexisingapore-my.sharepoint.com/:b:/g/personal/harshit_lexi_sg/EdOegeiR_gdBvQxdyW4xE6oBCDgj5E4Bo5wjvhPHpqgIuQ?e=TEu4vz"
    }
  ]
};
```


## **Submission Instructions** 
Push your code to a public GitHub repository titled: 

Lexisg-frontend-intern-test 

**[Bonus Points]: For hosting the solution** 

1\.  Include a README. md with: 

- How to run the project (npm install && npm start) 
- Screenshot or screen recording  
- How citation linking was handled 
## **Questions?** 
If you get stuck or need help setting up a local model, feel free to email us at <hi@lexi.sg>. We look forward to seeing your submission! 

Team **Lexi** 

[ref1]: Aspose.Words.2054370a-7ad0-40f6-a652-396eebe1e068.001.png
