// plugins/plugin-tags.js

window.registerNextNotePlugin({
    name: "Tags",
    onLoad: function(app) {
        const panel = app.getNextNotePluginPanel("Tags");
        if (!panel) return;

        let currentPage = null;

        panel.innerHTML = `
            <input type="text" id="tagFilterInput" placeholder="Filter tags..." style="width: 95%;">
            <div id="tagsCloud" style="margin-top: 5px;"></div>
            <hr>
            <div id="currentPageTags" style="margin-top: 5px;"></div>
        `;
        const tagFilterInput = panel.querySelector('#tagFilterInput');
        const tagsCloud = panel.querySelector('#tagsCloud');
        const currentPageTagsDiv = panel.querySelector('#currentPageTags');

        function getTags() {
            const tags = new Set();
            const sections = window.sections || {};
            Object.values(sections).forEach(section => {
                (section.pages || []).forEach(page => {
                    (page.tags || []).forEach(tag => tags.add(tag));
                });
            });
            return Array.from(tags).sort();
        }

        function renderTagCloud() {
            tagsCloud.innerHTML = '';
            const tags = getTags();
            if (tags.length === 0) {
                tagsCloud.innerHTML = "<div>No tags yet.</div>";
                return;
            }
            tags.forEach(tag => {
                const chip = document.createElement("span");
                chip.className = "tag-chip";
                chip.textContent = tag;
                // Add filtering logic here later
                tagsCloud.appendChild(chip);
            });
        }

        function renderPageTags() {
            currentPageTagsDiv.innerHTML = '<h4>Page Tags</h4>';
            if (!currentPage) {
                currentPageTagsDiv.innerHTML += "<div>No page selected.</div>";
                return;
            }

            (currentPage.tags || []).forEach(tag => {
                const chip = document.createElement("span");
                chip.className = "tag-chip";
                chip.textContent = tag;
                const del = document.createElement("span");
                del.textContent = "✕";
                del.className = "tag-delete";
                del.onclick = () => {
                    removeTagFromPage(tag);
                };
                chip.appendChild(del);
                currentPageTagsDiv.appendChild(chip);
            });

            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Add tag…";
            input.onkeydown = (e) => {
                if (e.key === "Enter" && input.value.trim()) {
                    addTagToPage(input.value.trim());
                    input.value = "";
                }
            };
            currentPageTagsDiv.appendChild(input);
        }

        function addTagToPage(tag) {
            if (!currentPage) return;
            if (!currentPage.tags) currentPage.tags = [];
            if (!currentPage.tags.includes(tag)) {
                currentPage.tags.push(tag);
                app.saveSections();
            }
        }

        function removeTagFromPage(tag) {
            if (!currentPage || !currentPage.tags) return;
            currentPage.tags = currentPage.tags.filter(t => t !== tag);
            app.saveSections();
        }

        app.events.on('pageSelected', (page) => {
            currentPage = page;
            renderPageTags();
        });

        app.events.on('sectionsUpdated', () => {
            renderTagCloud();
            renderPageTags();
        });

        renderTagCloud();
        renderPageTags();
    }
});
