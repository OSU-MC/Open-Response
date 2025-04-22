# Test info

- Name: Accessibility checks >> Home page should have no accessibility violations
- Location: /home/n8srumsey/Open-Response/tests/playwright/a11y.spec.js:7:7

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 399

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 3.94,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#808080",
+               "fontSize": "12.0pt (16px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.94 (foreground color: #808080, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<body>",
+                 "target": Array [
+                   "body",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.94 (foreground color: #808080, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<a class=\"changePasswordLink\" href=\"/reset\">Forgot your password?</a>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".changePasswordLink",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 3.94,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#808080",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.94 (foreground color: #808080, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<body>",
+                 "target": Array [
+                   "body",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.94 (foreground color: #808080, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"orSSOText\">or</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "p",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+     ],
+   },
+   Object {
+     "description": "Ensure <img> elements have alternative text or a role of none or presentation",
+     "help": "Images must have alternative text",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/image-alt?application=playwright",
+     "id": "image-alt",
+     "impact": "critical",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "has-alt",
+             "impact": "critical",
+             "message": "Element does not have an alt attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-label",
+             "impact": "critical",
+             "message": "aria-label attribute does not exist or is empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-labelledby",
+             "impact": "critical",
+             "message": "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "noAttr",
+             },
+             "id": "non-empty-title",
+             "impact": "critical",
+             "message": "Element has no title attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "presentational-role",
+             "impact": "critical",
+             "message": "Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element does not have an alt attribute
+   aria-label attribute does not exist or is empty
+   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
+   Element has no title attribute
+   Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+         "html": "<img class=\"classroomIcon\" src=\"classroomIcon.png\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           ".classroomIcon",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "has-alt",
+             "impact": "critical",
+             "message": "Element does not have an alt attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-label",
+             "impact": "critical",
+             "message": "aria-label attribute does not exist or is empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-labelledby",
+             "impact": "critical",
+             "message": "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "noAttr",
+             },
+             "id": "non-empty-title",
+             "impact": "critical",
+             "message": "Element has no title attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "presentational-role",
+             "impact": "critical",
+             "message": "Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element does not have an alt attribute
+   aria-label attribute does not exist or is empty
+   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
+   Element has no title attribute
+   Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+         "html": "<img src=\"/arrow-left-solid.svg\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           "img[src$=\"arrow-left-solid.svg\"]",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.text-alternatives",
+       "wcag2a",
+       "wcag111",
+       "section508",
+       "section508.22.a",
+       "TTv5",
+       "TT7.a",
+       "TT7.b",
+       "EN-301-549",
+       "EN-9.1.1.1",
+       "ACT",
+     ],
+   },
+   Object {
+     "description": "Ensure the document has a main landmark",
+     "help": "Document should have one main landmark",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/landmark-one-main?application=playwright",
+     "id": "landmark-one-main",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [
+           Object {
+             "data": null,
+             "id": "page-has-main",
+             "impact": "moderate",
+             "message": "Document does not have a main landmark",
+             "relatedNodes": Array [],
+           },
+         ],
+         "any": Array [],
+         "failureSummary": "Fix all of the following:
+   Document does not have a main landmark",
+         "html": "<html lang=\"en\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "html",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.semantics",
+       "best-practice",
+     ],
+   },
+   Object {
+     "description": "Ensure all page content is contained by landmarks",
+     "help": "All page content should be contained by landmarks",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/region?application=playwright",
+     "id": "region",
+     "impact": "moderate",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<div class=\"leftContainer\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".leftContainer",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<h1>Log in</h1>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".loginSection > h1",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<input type=\"text\" name=\"email\" class=\"inputContainer emailContainer\" placeholder=\"Email Address\" value=\"\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".emailContainer",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<input type=\"password\" name=\"rawPassword\" class=\"inputContainer passwordContainer\" placeholder=\"Password\" value=\"\">",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".passwordContainer",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<a class=\"changePasswordLink\" href=\"/reset\">Forgot your password?</a>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           ".changePasswordLink",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "isIframe": false,
+             },
+             "id": "region",
+             "impact": "moderate",
+             "message": "Some page content is not contained by landmarks",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Some page content is not contained by landmarks",
+         "html": "<p class=\"orSSOText\">or</p>",
+         "impact": "moderate",
+         "none": Array [],
+         "target": Array [
+           "p",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.keyboard",
+       "best-practice",
+     ],
+   },
+ ]
    at /home/n8srumsey/Open-Response/tests/playwright/a11y.spec.js:28:49
```

# Page snapshot

```yaml
- img
- heading "Welcome Back!" [level=1]
- heading "New user?" [level=2]:
  - link "New user?":
    - /url: /create
- link "Return to home":
  - /url: /home
  - img
  - text: Return to home
- heading "Log in" [level=1]
- textbox "Email Address"
- textbox "Password"
- link "Forgot your password?":
  - /url: /reset
- button "Log in"
- paragraph: or
- button "Continue with SSO"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import AxeBuilder from '@axe-core/playwright';
   3 | import fs from 'fs';
   4 | import path from 'path';
   5 |
   6 | test.describe('Accessibility checks', () => {
   7 |   test('Home page should have no accessibility violations', async ({ page }) => {
   8 |     // Navigate to the target page
   9 |     await page.goto('http://localhost:3000'); // Replace with your application's URL
  10 |
  11 |     // Perform accessibility analysis
  12 |     const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  13 |
  14 |     // Define the output directory and file path
  15 |     const outputDir = path.resolve(process.cwd(), 'a11y-results');
  16 |     const filePath = path.join(outputDir, 'home.json');
  17 |
  18 |     // Ensure the output directory exists
  19 |     if (!fs.existsSync(outputDir)) {
  20 |       fs.mkdirSync(outputDir);
  21 |     }
  22 |
  23 |     // Write the accessibility scan results to a JSON file
  24 |     fs.writeFileSync(filePath, JSON.stringify(accessibilityScanResults, null, 2));
  25 |     console.log(`Accessibility scan results written to ${filePath}`);
  26 |
  27 |     // Assert that there are no accessibility violations
> 28 |     expect(accessibilityScanResults.violations).toEqual([]);
     |                                                 ^ Error: expect(received).toEqual(expected) // deep equality
  29 |   });
  30 | });
  31 |
```