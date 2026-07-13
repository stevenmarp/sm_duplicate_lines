/** @odoo-module **/

import { patch } from '@web/core/utils/patch';
import { StaticList } from '@web/views/relational_model';

const DUPLICATE_CTX_KEY = 'duplicate_one2many_record';

patch(StaticList.prototype, {
    async addNew(params) {
        const record = await super.addNew(params);
        if (params?.context?.[DUPLICATE_CTX_KEY]) {
            await record.update({});
            delete params.context[DUPLICATE_CTX_KEY];
        }
        return record;
    },
});
