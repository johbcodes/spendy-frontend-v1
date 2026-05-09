# Approvals Feature

The approvals feature owns expense and payment approval workflows, including single approvals, batch expense approvals, supplier assignment, rejection, and undoing rejected requests.

## Structure

```text
features/approvals/
  api.ts
  hooks.ts
  types.ts
  schemas.ts
  rules.ts
  mappers.ts
  pages/
    Approvals.tsx
    BatchApprovalReview.tsx
    RequestReview.tsx
  modals/
    ApproveExpenseModal.tsx
    ApproveRejectModal.tsx
    BatchDisbursementModal.tsx
    EditRequestModal.tsx
  __tests__/
    approvals.test.ts
```

## Migration Status

- Pages and modals live under `src/features/approvals`.
- Legacy root page/modal files re-export the feature implementations as compatibility shims.
- Filtering, stats, export mapping, approval status patches, and batch/supplier checks are feature-owned.
- `App.tsx` still orchestrates cross-feature side effects such as wallet movement, expense updates, supplier payment records, notifications, and navigation.

## Next Steps

1. Move approval side effects from `App.tsx` into a feature controller/service boundary.
2. Add tests around approve/reject side effects once wallets, expenses, payments, and suppliers have stable feature controllers.
3. Remove compatibility shims after all imports use `src/features/approvals`.
