/** @odoo-module **/

import { patch } from '@web/core/utils/patch';
import { X2ManyField } from '@web/views/fields/x2many/x2many_field';
import { registry } from '@web/core/registry';

// Support options-based: options="{'disable_lines_duplicate': True}"
patch(X2ManyField.prototype, {
    get rendererProps() {
        const props = this._super();
        if (this.props.crudOptions?.disable_lines_duplicate || this.props.disableLinesDuplicate) {
            props.disableLinesDuplicate = true;
        }
        return props;
    },
});

// Support attribute-based: disable_lines_duplicate="1"
const fieldRegistry = registry.category("fields");
for (const key of ["one2many", "many2many"]) {
    const def = fieldRegistry.get(key);
    if (def && def.extractProps) {
        const origExtract = def.extractProps;
        def.extractProps = (fieldInfo, dynamicInfo) => {
            const props = origExtract(fieldInfo, dynamicInfo);
            if (fieldInfo.attrs?.disable_lines_duplicate) {
                props.disableLinesDuplicate = true;
            }
            return props;
        };
    }
}
