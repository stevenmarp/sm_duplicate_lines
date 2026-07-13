/** @odoo-module **/

import { patch } from '@web/core/utils/patch';
import { ListRenderer } from '@web/views/list/list_renderer';
import { serializeDate, serializeDateTime } from '@web/core/l10n/dates';

export const DUPLICATE_CONTEXT_KEY = 'duplicate_one2many_record';

const ALLOWED_LINE_MODELS = [
    'sale.order.line',
    'purchase.order.line',
    'account.move.line',
];

patch(ListRenderer.prototype, {
    get showCopyButton() {
        console.log("showCopyButton check 16:", {
            isX2Many: this.isX2Many,
            canCreate: this.canCreate,
            disableLinesDuplicate: this.props.disableLinesDuplicate,
            resModel: this.props.list?.resModel,
        });
        if (!this.isX2Many || !this.canCreate || this.props.disableLinesDuplicate) {
            return false;
        }
        const resModel = this.props.list?.resModel;
        return resModel ? ALLOWED_LINE_MODELS.includes(resModel) : false;
    },

    set showCopyButton(value) {},

    _getX2ManyIds(record, fieldName) {
        const x2ManyValue = record.data[fieldName];
        if (!x2ManyValue) return [];

        let records;
        if ('records' in x2ManyValue) {
            records = x2ManyValue.records;
        } else if ('data' in x2ManyValue) {
            records = x2ManyValue.data;
        }

        if (!Array.isArray(records)) return [];

        const ids = records.filter(rec => rec.data?.id).map(rec => rec.data.id);
        if (ids.length) return ids;

        const parentIds = records
            .filter(rec => rec._parentRecord?.data[fieldName]?.currentIds)
            .map(rec => rec._parentRecord.data[fieldName].currentIds);
        return parentIds.length ? parentIds[0] : [];
    },

    _buildCopyValues(record) {
        const values = {};
        for (const [fieldName, fieldProps] of Object.entries(record.fields)) {
            if (!fieldProps.copy) continue;

            let value;
            switch (fieldProps.type) {
                case 'many2one': {
                    const m2oValue = record.data[fieldName];
                    if (m2oValue) {
                        if ('data' in m2oValue) {
                            value = m2oValue.data?.id || false;
                        } else if (Array.isArray(m2oValue) && m2oValue.length) {
                            value = m2oValue[0];
                        }
                    } else {
                        value = false;
                    }
                    break;
                }
                case 'many2many':
                case 'one2many':
                    value = [[6, 0, this._getX2ManyIds(record, fieldName)]];
                    break;
                case 'datetime':
                    value = record.data[fieldName]
                        ? serializeDateTime(record.data[fieldName])
                        : false;
                    break;
                case 'date':
                    value = record.data[fieldName]
                        ? serializeDate(record.data[fieldName])
                        : false;
                    break;
                default:
                    value = record.data[fieldName];
                    break;
            }
            if (value !== undefined) {
                values[`default_${fieldName}`] = value;
            }
        }
        return values;
    },

    async onCopyRecord(record) {
        const context = record.context;
        const newCopyData = {
            [DUPLICATE_CONTEXT_KEY]: 1,
        };

        if (record.resId) {
            if (record.isDirty) {
                await this.props.list.model.root.save({ stayInEdition: true });
            }
            let copyData = await this.env.services.orm.call(
                record.resModel,
                'copy_data',
                [record.resId],
                { context }
            );
            if (copyData) {
                copyData = copyData[0];
            }
            for (const [fieldName, fieldValue] of Object.entries(copyData)) {
                newCopyData[`default_${fieldName}`] = fieldValue;
            }
        } else {
            Object.assign(newCopyData, this._buildCopyValues(record));
        }

        const contextToPass = Object.assign({}, context, newCopyData);
        await this.props.onAdd({ context: contextToPass });
    },
});

ListRenderer.props = [
    ...ListRenderer.props,
    'disableLinesDuplicate?',
];
