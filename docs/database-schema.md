# Database schema

## Relationships

```text
User (1)  ───< Lead (many)
Lead (1)  ───< FollowUp (many)
```

`Lead.assignedTo` references a User. `FollowUp.leadId` references a Lead. Follow-ups are normalized rather than embedded so their history can grow independently and be queried efficiently.

## User

| Field | Type | Notes |
| --- | --- | --- |
| `username` | String | Required, lowercase, unique, 3–50 chars |
| `password` | String | Required bcrypt hash, excluded by default from query output |
| `role` | String | `admin` or `user`; default `user` |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

## Lead

| Field | Type | Notes |
| --- | --- | --- |
| `leadName`, `companyName` | String | Required, trimmed |
| `mobile` | String | Required, phone format, unique |
| `email` | String | Required, normalized lowercase, unique |
| `serviceRequired`, `leadSource`, `leadStatus` | String | Required centralized enums |
| `estimatedValue` | Number | Optional, non-negative |
| `assignedTo` | ObjectId | Required reference to User |
| `remarks` | String | Optional, max 2,000 chars |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

Indexes: unique `email`; unique `mobile`; compound `leadStatus, createdAt`; compound `serviceRequired, createdAt`; compound `assignedTo, createdAt`; and descending `createdAt`. These serve duplicate detection, dashboard/list filters, and default ordering.

## FollowUp

| Field | Type | Notes |
| --- | --- | --- |
| `leadId` | ObjectId | Required reference to Lead |
| `date` | Date | Required follow-up date |
| `followUpType` | String | Required centralized enum |
| `remarks` | String | Required, max 2,000 chars |
| `nextFollowUpDate` | Date | Optional; cannot precede `date` |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

Indexes: `leadId` and compound `leadId, date` (descending) support fast history retrieval. Deleting a lead explicitly removes its follow-ups to prevent orphan records.

## Duplicate decision

The system rejects a new or updated lead if either normalized email or mobile is already in use. This is deterministic and prevents the same contact being recorded under a different phone/email combination.
