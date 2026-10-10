/**
 * Sätteri hast plugin: wrap every <table> in <div class="table-scroll"> so a wide
 * table scrolls inside its column instead of widening the page.
 * Plugin shape follows @astrojs/markdown-satteri: { name, element: { filter, visit } },
 * where visit may return a replacement node.
 */
export function wrapTables() {
  return {
    name: 'wrap-tables',
    element: {
      filter: ['table'],
      visit(node) {
        return { type: 'element', tagName: 'div', properties: { className: ['table-scroll'] }, children: [node] };
      },
    },
  };
}
