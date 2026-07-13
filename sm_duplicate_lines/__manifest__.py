{
    'name': 'Duplicate Lines | One Click Row Copy | Sale Orders | Purchase Orders | Invoices',
    'version': '15.0.1.0.0',
    'category': 'Extra Tools',
    'summary': 'Duplicate order lines in Sale Orders, Purchase Orders & Invoices with a single click',
    'description': """
Duplicate Lines
===============
Adds a copy button to each row in Sale Order, Purchase Order and Invoice line lists,
allowing users to duplicate lines with a single click.

**Key Features:**
- One-click row duplication on Sale Orders, Purchase Orders & Invoices
- Handles all field types (Many2one, Many2many, One2many, Date, Datetime, etc.)
- Works on both saved records (server-side copy) and unsaved new lines (client-side copy)
- Respects Python copy=False attribute — excluded fields are never copied
- Onchange methods suppressed during duplication to preserve copied values
- Can be disabled per field using disable_lines_duplicate="1" XML attribute
- Print friendly — copy column hidden when printing
- Lightweight — only depends on the web module
    """,
    'author': 'Steven Marp',
    'depends': ['web'],
    'data': [],
    'assets': {
        'web.assets_backend': [
            'sm_duplicate_lines/static/src/js/duplicate_lines.js',
            'sm_duplicate_lines/static/src/css/duplicate_lines.css',
        ],
    },
    'images': ['static/description/banner.gif'],
    'installable': True,
    'auto_install': False,
    'application': False,
    'license': 'OPL-1',
    'price': 7.02,
    'currency': 'USD',
}
