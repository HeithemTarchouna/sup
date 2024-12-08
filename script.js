document.getElementById('queryForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const query = document.getElementById('queryInput').value;
    const responseContainer = document.getElementById('responseContainer');

    responseContainer.textContent = 'Loading...';

    try {
        const response = await fetch('https://8002-01jem2v2z9xvn6335vrna2an1e.cloudspaces.litng.ai/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Extract the main response
        const mainResponse = data.output.response;

        // Extract the sources
        const sources = data.output.source_nodes.map((node) => {
            const metadata = node.node.metadata;
            return {
                fileName: metadata.file_name.replace('.pdf', ''), // Remove the .pdf extension
                pageLabel: metadata.page_label
            };
        });

        // Build the HTML for the response and sources
        let sourcesHtml = '<h3>Related Documents:</h3><ul>';
        sources.forEach((source) => {
            // Encode the file name for use in a URL
            const encodedFileName = encodeURIComponent(source.fileName);
            // Construct the Confluence search URL
            const confluenceSearchUrl = `https://twipe.atlassian.net/wiki/search?text=${encodedFileName}`;
            sourcesHtml += `
                <li>
                    <a href="${confluenceSearchUrl}" target="_blank">${source.fileName}</a>
                    <br><small>Page: ${source.pageLabel}</small>
                </li>
            `;
        });
        sourcesHtml += '</ul>';

        responseContainer.innerHTML = `
            <h2>Response:</h2>
            <p>${mainResponse}</p>
            ${sourcesHtml}
        `;
    } catch (error) {
        console.error('Error:', error); // Log the error for debugging
        responseContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
});
