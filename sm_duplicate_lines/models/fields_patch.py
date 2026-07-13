from odoo.fields import Field

_original_get_description = Field.get_description


def _patched_get_description(self, env):
    desc = _original_get_description(self, env)
    desc['copy'] = self.copy
    return desc


Field.get_description = _patched_get_description
