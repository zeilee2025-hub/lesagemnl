# PHASE 0.5 BACKUP + BASELINE

Created: 2026-07-06 00:28:47 +08:00
Workspace: C:\Users\suppo\OneDrive\Desktop\Le Sage MNL\lesage.mnl-v2

## Scope
- Frontend backup only.
- Backend remains read-only and was not copied or modified.
- No implementation changes included.

## Risk Locks Preserved
- Approve Payment remains frontend-restricted to PROOF_UPLOADED -> PAID via handleApprove().
- Reject Payment remains frontend-restricted to PROOF_UPLOADED -> REJECTED via handleReject().
- Mark as Shipped remains frontend-restricted to PAID -> SHIPPED via handleShip().
- Mark as Completed remains frontend-owned SHIPPED -> COMPLETED via handleComplete() and updateOrderStatus().
- No Cancel Order action is added; CANCELLED remains display/filter only.
- EXPIRED remains backend-authoritative through expirePendingOrders().
- Stock deduction remains backend-owned through deductStockTransaction(items).
- Tracking remains existing J&T behavior through /ship-order.
- Existing backend stockDeducted failure window remains recorded risk only.

## Backed Up Files
| Path | SHA256 | Lines |
|---|---|---:|
| admin.html | F1B90C7A05815EE4D5158F5FB291B6A07E4F737A5F81BEF2E8EC4A6D0CCB9121 | 248 |
| admin-login.html | 3282208B03AC10BB7D4F5ECCF5A2F9F6FCBABDB5E5583EAAE8D8FB0258E476C2 | 115 |
| js/pages/admin.js | FE08889C3BCF5428AF382839402297F9EF7431FAF1BA504515FE3DB4EA6DF4D6 | 843 |
| js/pages/admin-login.js | A10071B204780DDA98DF7294FD43314A3CD1D812B2EC994CD61947ECBF38A7BB | 89 |
| js/components/adminUI.js | 44773124D9966EF0399CF9BCDD140C0EA4160775A4400B903BD2C146CC80B367 | 693 |
| js/services/orderService.js | E698E23BD7711AE7029A7D5E3AE5034C1A2F8BEE1A2DCBC590C8A17C16CD5DC6 | 525 |
| js/services/productService.js | DAEB9387FF4EE62E541425E63B03BC16387E7EC2F1027B717AEBAD60C95B0E10 | 571 |
| js/services/authService.js | D8C7498EB9D1076D7E833DB8FBCE1AB7A692BD931E0EBB129675B25CA1360A64 | 367 |
| js/services/config/api.js | 25399091F5FE5B2D2382425D858B6A0AA9C3DA4503C4B4CBB96F894BFBB63793 | 2 |
| js/core/firebase.js | 79E097FC61F5B721B0A2B2E923911D3EE56B067ACE76AD8DEF084405A7DC55B1 | 56 |
| js/core/orderUI.js | 5ACFB60D0E3C6350D5961EE59287ADB8E22B5D64909A527C6FCF17F7E5486A4C | 335 |
| js/core/stock.js | EFEE9EBAA875284803222E0C6770AA314E17FF5AD81C05A729AE6C462731E0F0 | 353 |
| css/pages/admin.css | D984CA1FED54BE2B8DAF91FD1847C63E318B7262D71B7FC63FA7C2DFDB6BD256 | 188 |
| css/pages/admin-login.css | 936100622C87480F145BF4392257DCC6A71F278956C3F8586BB1459C52FEE5A8 | 199 |
| css/components/admin-orders.css | B7F7EDA8CA5E115C60D6B55AE28EA807B3178F087C08F1A2686B17B40363A779 | 637 |
| css/components/admin-stats.css | AFD8A9C4C366CE1E66A7205F543F4D8D8509CE169E8D22979F5A18AFAC434FE6 | 47 |

## Notes
- This directory is a baseline snapshot for future admin upgrade phases.
- Do not treat this snapshot as an implementation phase.
