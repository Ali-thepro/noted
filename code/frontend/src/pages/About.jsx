const About = () => {
  return (
    <div className='min-h-screen pb-32'>
      <div className='max-w-4xl mx-auto p-6'>
        <div className='space-y-12'>
          {/* Header Section */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold mb-4'>About Noted</h1>
            <p className='text-lg text-gray-600 dark:text-gray-400'>
              A powerful Markdown note-taking application with advanced features, encryption and version control.
            </p>
          </div>

          {/* Introduction */}
          <section className='prose dark:prose-invert max-w-none'>
            <p className='lead'>
              Welcome to Noted! This platform combines the simplicity of Markdown with powerful features
              for both web and terminal use. Below is a comprehensive guide to help you make the most
              of Markdown in Noted.
            </p>
          </section>

          {/* Basic Syntax Section */}
          <section className='space-y-8'>
            <h2 className='text-3xl font-semibold mb-6'>Basic Markdown Syntax</h2>

            {/* Headers */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Headers</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`}</pre>
                </div>
                <div className='space-y-2'>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <h1 className='text-2xl font-bold'>Heading 1</h1>
                    <h2 className='text-xl font-bold'>Heading 2</h2>
                    <h3 className='text-lg font-bold'>Heading 3</h3>
                    <h4 className='text-base font-bold'>Heading 4</h4>
                    <h5 className='text-sm font-bold'>Heading 5</h5>
                    <h6 className='text-xs font-bold'>Heading 6</h6>
                  </div>
                </div>
              </div>
              <div className='mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
                <p className='text-sm text-blue-800 dark:text-blue-200'>
                  <strong>Tip:</strong> Always add a space between the # symbols and your heading text for better compatibility.
                </p>
              </div>
            </div>

            {/* Emphasis and Text Formatting */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Emphasis and Text Formatting</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Bold:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {`**Bold text with asterisks**
__Bold text with underscores__
Love**is**bold`}</pre>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Italic:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {`*Italic text with asterisks*
_Italic text with underscores_
A*cat*meow`}</pre>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Bold and Italic:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {`***Bold and italic***
___Bold and italic___
**_Bold and italic_**
*__Bold and italic__*`}</pre>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Strikethrough:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {`~~Strikethrough text~~
This is ~~not~~ correct`}</pre>
                  </div>
                </div>
                <div className='space-y-2'>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-4'>
                    <div>
                      <p><strong>Bold text with asterisks</strong></p>
                      <p><strong>Bold text with underscores</strong></p>
                      <p>Love<strong>is</strong>bold</p>
                    </div>
                    <div>
                      <p><em>Italic text with asterisks</em></p>
                      <p><em>Italic text with underscores</em></p>
                      <p>A<em>cat</em>meow</p>
                    </div>
                    <div>
                      <p><strong><em>Bold and italic</em></strong></p>
                    </div>
                    <div>
                      <p><del>Strikethrough text</del></p>
                      <p>This is <del>not</del> correct</p>
                    </div>
                  </div>
                  <div className='mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
                    <p className='text-sm text-blue-800 dark:text-blue-200'>
                      <strong>Best Practice:</strong> Use asterisks (*) instead of underscores (_) for better compatibility, especially within words.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Rules */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Horizontal Rules</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`Three or more...

---

Hyphens

***

Asterisks

___

Underscores`}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-4'>
                    <p>Three or more...</p>
                    <hr className='border-gray-300 dark:border-gray-600' />
                    <p>Hyphens</p>
                    <hr className='border-gray-300 dark:border-gray-600' />
                    <p>Asterisks</p>
                    <hr className='border-gray-300 dark:border-gray-600' />
                    <p>Underscores</p>
                  </div>
                  <div className='mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
                    <p className='text-sm text-blue-800 dark:text-blue-200'>
                      <strong>Best Practice:</strong> Add blank lines before and after horizontal rules for better compatibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lists */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Lists</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Unordered List:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {`- First item
- Second item
  - Nested item
  - Another nested item
- Third item`}</pre>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Ordered List:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {`1. First item
2. Second item
   1. Nested item
   2. Another nested item
3. Third item`}</pre>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                    <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                      <ul className='list-disc list-inside space-y-1'>
                        <li>First item</li>
                        <li>Second item
                          <ul className='list-disc list-inside pl-4 space-y-1'>
                            <li>Nested item</li>
                            <li>Another nested item</li>
                          </ul>
                        </li>
                        <li>Third item</li>
                      </ul>
                      <div className='mt-4'>
                        <ol className='list-decimal list-inside space-y-1'>
                          <li>First item</li>
                          <li>Second item
                            <ol className='list-decimal list-inside pl-4 space-y-1'>
                              <li>Nested item</li>
                              <li>Another nested item</li>
                            </ol>
                          </li>
                          <li>Third item</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Links and Images */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Links and Images</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Links:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {`[Basic link](https://example.com)
<https://example.com>
`}</pre>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Images:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {'![Alt text](image url)'}</pre>
                  </div>
                </div>
                <div className='space-y-2'>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2'>
                    <p><a href="https://example.com" className="text-blue-600 dark:text-blue-400 hover:underline">Basic link</a></p>
                    <p><a href="https://example.com" className="text-blue-600 dark:text-blue-400 hover:underline">https://example.com</a></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockquotes */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Blockquotes</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`> Simple blockquote
> Multiple line blockquote
> with continuation
>
> Nested blockquotes:
>> Nested level
>>> Deeper level`}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <blockquote className='border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2'>
                      <p>Simple blockquote</p>
                    </blockquote>
                    <blockquote className='border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2'>
                      <p>Multiple line blockquote<br />with continuation</p>
                      <p>Nested blockquotes:</p>
                      <blockquote className='border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2'>
                        <p>Nested level</p>
                        <blockquote className='border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2'>
                          <p>Deeper level</p>
                        </blockquote>
                      </blockquote>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Blocks */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Code</h3>
              <div className='space-y-6'>
                <div>
                  <h4 className='text-lg font-semibold mb-2'>Inline Code</h4>
                  <div className='grid grid-cols-2 gap-6'>
                    <div>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                      <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                        {'Use `console.log()` for debugging'}</pre>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                      <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                        <p>Use <code className='bg-gray-200 dark:bg-gray-700 px-1 rounded'>console.log()</code> for debugging</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='text-lg font-semibold mb-2'>Fenced Code Blocks</h4>
                  <div className='grid grid-cols-2 gap-6'>
                    <div>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                      <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm whitespace-pre-wrap'>
                        <code className='language-javascript'>
                          {`\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

// Call the function
greet("World");
\`\`\``}
                        </code>
                      </pre>

                    </div>
                    <div>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                      <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                        <pre className='text-sm'><code className='language-javascript'>
                          {`function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

// Call the function
greet("World");`}
                        </code></pre>
                      </div>
                    </div>
                  </div>
                  <div className='mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
                    <p className='text-sm text-blue-800 dark:text-blue-200'>
                      <strong>Tip:</strong> Specify the language after the opening backticks for syntax highlighting. Supported languages include: javascript, python, go, html, css, json, and many more.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Tables</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
| Cell 7   | Cell 8   | Cell 9   |`}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-600'>
                      <thead>
                        <tr>
                          <th className='px-4 py-2 text-left'>Header 1</th>
                          <th className='px-4 py-2 text-left'>Header 2</th>
                          <th className='px-4 py-2 text-left'>Header 3</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                        <tr>
                          <td className='px-4 py-2'>Cell 1</td>
                          <td className='px-4 py-2'>Cell 2</td>
                          <td className='px-4 py-2'>Cell 3</td>
                        </tr>
                        <tr>
                          <td className='px-4 py-2'>Cell 4</td>
                          <td className='px-4 py-2'>Cell 5</td>
                          <td className='px-4 py-2'>Cell 6</td>
                        </tr>
                        <tr>
                          <td className='px-4 py-2'>Cell 7</td>
                          <td className='px-4 py-2'>Cell 8</td>
                          <td className='px-4 py-2'>Cell 9</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Extended Features Section */}
          <section className='space-y-8'>
            <h2 className='text-3xl font-semibold mb-6'>Extended Features</h2>
            <div className='text-gray-600 dark:text-gray-400 mb-6'>
              <p>Noted supports several extended Markdown features that enhance your note-taking experience.</p>
              <p className='mt-2 text-sm bg-yellow-200 dark:bg-yellow-700/30 p-4 rounded-lg'>
                <span className='font-semibold'>Note:</span> These features will not be rendered in the CLI preview.
              </p>
            </div>

            {/* Task Lists */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Task Lists</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`- [x] Completed task
- [ ] Uncompleted task
- [x] Task with **bold** text
  - [ ] Nested task
  - [x] Completed nested task`}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <div className='space-y-2'>
                      <div className='flex items-center'>
                        <input type='checkbox' checked readOnly className='mr-2' disabled />
                        <span>Completed task</span>
                      </div>
                      <div className='flex items-center'>
                        <input type='checkbox' readOnly className='mr-2' disabled />
                        <span>Uncompleted task</span>
                      </div>
                      <div className='flex items-center'>
                        <input type='checkbox' checked readOnly className='mr-2' disabled />
                        <span>Task with <strong>bold</strong> text</span>
                      </div>
                      <div className='ml-6 space-y-2'>
                        <div className='flex items-center'>
                          <input type='checkbox' readOnly className='mr-2' disabled />
                          <span>Nested task</span>
                        </div>
                        <div className='flex items-center'>
                          <input type='checkbox' checked readOnly className='mr-2' disabled />
                          <span>Completed nested task</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Math Expressions */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Math Expressions</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`Inline math: $$E = mc^2$$

Block math:
$$$
{-b +- sqrt{b^2-4ac}}/{2a}
$$$`}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <p>Inline math: <span className='font-mono'>E = mc²</span></p>
                    <div className='mt-4 text-center font-mono'>
                      -b ± √(b² - 4ac)
                      <div className='border-t border-gray-400 dark:border-gray-600 my-1'></div>
                      2a
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagrams */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>PlantUML Diagrams</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response
Alice -> Bob: Another authentication Request
Alice <-- Bob: Another authentication Response
@enduml
`}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <p className='text-sm text-gray-500 dark:text-gray-400 italic'>
                      (Diagram will be rendered in the actual note)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footnotes */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Footnotes</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`Here's a sentence with a footnote[^1].

[^1]: This is a footnote with **bold text**.
You can have multiple paragraphs in footnotes.`}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <p>Here&apos;s a sentence with a footnote<sup>1</sup>.</p>
                    <hr className='my-4 border-gray-300 dark:border-gray-600' />
                    <div className='text-sm'>
                      <p><sup>1</sup> This is the footnote content with <strong>bold text</strong>.</p>
                      <p className='mt-2'>You can have multiple paragraphs in footnotes.</p>
                      <ul className='list-disc ml-6 mt-2'>
                        <li>Even lists</li>
                        <li>And other markup</li>
                      </ul>
                      <blockquote className='border-l-4 border-gray-300 dark:border-gray-600 pl-4 mt-2'>
                        And blockquotes too!
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Abbreviations */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Abbreviations</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

The HTML specification is maintained by the W3C.`}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <p>The <abbr title='Hyper Text Markup Language'>HTML</abbr> specification
                      is maintained by the <abbr title='World Wide Web Consortium'>W3C</abbr>.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Text Formatting */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Advanced Text Formatting</h3>

              {/* Underline */}
              <div className='mb-6'>
                <h4 className='text-lg font-semibold mb-2'>Underline</h4>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {'++Underlined text++'}</pre>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                    <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                      <p><u>Underlined text</u></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlight */}
              <div className='mb-6'>
                <h4 className='text-lg font-semibold mb-2'>Highlight</h4>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {'==Highlighted text=='}</pre>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                    <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                      <p><mark>Highlighted text</mark></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Superscript */}
              <div className='mb-6'>
                <h4 className='text-lg font-semibold mb-2'>Superscript</h4>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {`X^2^ + Y^2^ = Z^2^
2^nd^ of July`}</pre>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                    <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                      <p>X<sup>2</sup> + Y<sup>2</sup> = Z<sup>2</sup></p>
                      <p>2<sup>nd</sup> of July</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscript */}
              <div className='mb-6'>
                <h4 className='text-lg font-semibold mb-2'>Subscript</h4>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                    <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                      {`H~2~O
CO~2~`}</pre>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                    <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                      <p>H<sub>2</sub>O</p>
                      <p>CO<sub>2</sub></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emoji */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Emoji</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`:smile: :heart: :thumbsup:
Gone camping! :tent: Be back soon.
That is so funny! :joy:`}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <p>😄 ❤️ 👍</p>
                    <p>Gone camping! ⛺ Be back soon.</p>
                    <p>That is so funny! 😂</p>
                  </div>
                </div>
              </div>
              <div className='mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
                <p className='text-sm text-blue-800 dark:text-blue-200'>
                  <strong>Note:</strong> You can use see the full list of emojis <a href='https://www.webfx.com/tools/emoji-cheat-sheet/' target='_blank' rel='noopener noreferrer' className="text-blue-500 dark:text-blue-600">here</a>
                </p>
              </div>
            </div>

            {/* Image Size Control */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Image Size Control</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {'![image](https://example.com/image.png =300x300)'}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Result:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <p className='text-sm mb-2'>Image with width and height of 300px</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Definition Lists */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Definition Lists</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`First Term
: This is the definition of the first term.

Second Term
: This is one definition of the second term.
: This is another definition of the second term.`}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <dl>
                      <dt className='font-bold'>First Term</dt>
                      <dd className='ml-4 mb-2'>This is the definition of the first term.</dd>
                      <dt className='font-bold'>Second Term</dt>
                      <dd className='ml-4'>This is one definition of the second term.</dd>
                      <dd className='ml-4'>This is another definition of the second term.</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm'>
              <h3 className='text-2xl font-semibold mb-4'>Table of Contents</h3>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Markdown Input:</p>
                  <pre className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm'>
                    {`[toc]
`}</pre>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>Rendered Output:</p>
                  <div className='bg-gray-50 dark:bg-gray-900 p-4 rounded-lg'>
                    <nav className="toc">
                      <ul className="space-y-1">
                        <li><a href="#introduction" className="text-blue-600 dark:text-blue-400 hover:underline">Introduction</a>
                          <ul className="ml-4 space-y-1">
                            <li><a href="#getting-started" className="text-blue-600 dark:text-blue-400 hover:underline">Getting Started</a>
                              <ul className="ml-4 space-y-1">
                                <li><a href="#installation" className="text-blue-600 dark:text-blue-400 hover:underline">Installation</a></li>
                                <li><a href="#configuration" className="text-blue-600 dark:text-blue-400 hover:underline">Configuration</a></li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                        <li><a href="#features" className="text-blue-600 dark:text-blue-400 hover:underline">Features</a>
                          <ul className="ml-4 space-y-1">
                            <li><a href="#basic-features" className="text-blue-600 dark:text-blue-400 hover:underline">Basic Features</a></li>
                            <li><a href="#advanced-features" className="text-blue-600 dark:text-blue-400 hover:underline">Advanced Features</a>
                              <ul className="ml-4 space-y-1">
                                <li><a href="#custom-plugins" className="text-blue-600 dark:text-blue-400 hover:underline">Custom Plugins</a></li>
                                <li><a href="#api-reference" className="text-blue-600 dark:text-blue-400 hover:underline">API Reference</a></li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
              <div className='mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
                <p className='text-sm text-blue-800 dark:text-blue-200'>
                  <strong>Usage:</strong> Add [toc] where you want the table of contents to appear. It will automatically generate a nested list of all headers in the document, with clickable links.
                  <ul className='list-disc ml-4 mt-2'>
                    <li>Automatically updates as you add/remove headers</li>
                    <li>Supports up to 6 levels of nesting</li>
                    <li>Creates anchor links automatically</li>
                    <li>Respects header hierarchy</li>
                  </ul>
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

export default About
