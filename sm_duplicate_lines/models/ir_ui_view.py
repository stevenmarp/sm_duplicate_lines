from odoo import api, models


class Base(models.AbstractModel):
    _inherit = 'base'

    @api.model
    def _get_view_field_attributes(self):
        attributes = super()._get_view_field_attributes()
        if 'copy' not in attributes:
            attributes.append('copy')
        return attributes

    def _onchange_eval(self, field_name, onchange, result):
        if self.env.context.get('duplicate_one2many_record'):
            return
        return super()._onchange_eval(field_name, onchange, result)
