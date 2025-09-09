// plugins/plugin-outline.js

window.registerNextNotePlugin({
    name: "Outline",
    onLoad: function(app) {
        const outlinePanel = app.getNextNotePluginPanel("Outline");
        if (!outlinePanel) return;

        function getOutlineFromPage(page) {
            const headings = [];
            if (!page || !page.markdown) return headings;
            const lines = page.markdown.split('\n');
            lines.forEach(line => {
                const m = line.match(/^(#+)\s+(.*)$/);
                if (m) {
                    const level = m[1].length;
                    headings.push({
                        level,
                        text: m[2].trim()
                    });
                }
            });
            return headings;
        }

        function renderOutline(page) {
            outlinePanel.innerHTML = "";
            if (!page) {
                outlinePanel.style.display = "none";
                return;
            }
            const headings = getOutlineFromPage(page);
            if (!headings.length) {
                outlinePanel.innerHTML = "<div>No headings found.</div>";
                return;
            }

            headings.forEach(h => {
                const entry = document.createElement("div");
                entry.className = `outline-entry outline-h${h.level}`;
                entry.textContent = h.text;
                // Scroll to heading functionality can be improved later
                outlinePanel.appendChild(entry);
            });
        }

        app.events.on('pageSelected', (page) => {
            renderOutline(page);
        });

        // Initial render for the current page if it exists
        if (window.currentPage) {
            renderOutline(window.currentPage);
        }
    }
});
