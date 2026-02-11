# Event Questions Payload Examples

This document provides comprehensive example payloads for event questions in the dashboard API, covering all question types and edge cases.

## Question Types

The following question types are supported:
- `SHORT_TEXT` - Single-line text input
- `LONG_TEXT` - Multi-line text input
- `SINGLE_CHOICE` - Radio button selection (requires options)
- `MULTI_CHOICE` - Checkbox selection (requires options)
- `DROPDOWN` - Dropdown selection (requires options)
- `DATE` - Date picker

## Field Constraints

- `label`: Required, string, max 500 characters
- `type`: Required, one of the EventQuestionType enum values
- `isRequired`: Optional, boolean, default: `false`
- `position`: Optional, integer, min: 0, default: array index
- `placeholder`: Optional, string, max 255 characters
- `helpText`: Optional, string, max 1000 characters
- `options`: Optional, array, max 50 items (required for SINGLE_CHOICE, MULTI_CHOICE, DROPDOWN)

## Option Structure

Each option in the `options` array has:
- `label`: Required, string, max 200 characters
- `value`: Optional, string, max 100 characters (defaults to label if not provided)

---

## Example Payloads

### 1. SHORT_TEXT - Minimal

```json
{
  "label": "What is your name?",
  "type": "SHORT_TEXT"
}
```

### 2. SHORT_TEXT - Full

```json
{
  "label": "What is your email address?",
  "type": "SHORT_TEXT",
  "isRequired": true,
  "position": 0,
  "placeholder": "Enter your email",
  "helpText": "We will use this email to send you event updates and confirmations."
}
```

### 3. LONG_TEXT - Minimal

```json
{
  "label": "Tell us about yourself",
  "type": "LONG_TEXT"
}
```

### 4. LONG_TEXT - Full

```json
{
  "label": "Do you have any dietary restrictions or allergies?",
  "type": "LONG_TEXT",
  "isRequired": false,
  "position": 1,
  "placeholder": "Please list any dietary restrictions or allergies",
  "helpText": "This information helps us prepare appropriate meals for the event."
}
```

### 5. SINGLE_CHOICE - Minimal (with options)

```json
{
  "label": "What is your preferred language?",
  "type": "SINGLE_CHOICE",
  "options": [
    {
      "label": "English"
    },
    {
      "label": "German"
    },
    {
      "label": "French"
    }
  ]
}
```

### 6. SINGLE_CHOICE - Full (with custom values)

```json
{
  "label": "What is your experience level?",
  "type": "SINGLE_CHOICE",
  "isRequired": true,
  "position": 2,
  "helpText": "Select the option that best describes your experience",
  "options": [
    {
      "label": "Beginner",
      "value": "beginner"
    },
    {
      "label": "Intermediate",
      "value": "intermediate"
    },
    {
      "label": "Advanced",
      "value": "advanced"
    },
    {
      "label": "Expert",
      "value": "expert"
    }
  ]
}
```

### 7. MULTI_CHOICE - Minimal

```json
{
  "label": "Which topics interest you?",
  "type": "MULTI_CHOICE",
  "options": [
    {
      "label": "Technology"
    },
    {
      "label": "Business"
    },
    {
      "label": "Design"
    }
  ]
}
```

### 8. MULTI_CHOICE - Full (many options)

```json
{
  "label": "Select all that apply",
  "type": "MULTI_CHOICE",
  "isRequired": false,
  "position": 3,
  "helpText": "You can select multiple options",
  "options": [
    {
      "label": "Option 1",
      "value": "opt1"
    },
    {
      "label": "Option 2",
      "value": "opt2"
    },
    {
      "label": "Option 3",
      "value": "opt3"
    },
    {
      "label": "Option 4",
      "value": "opt4"
    },
    {
      "label": "Option 5",
      "value": "opt5"
    }
  ]
}
```

### 9. DROPDOWN - Minimal

```json
{
  "label": "Select your country",
  "type": "DROPDOWN",
  "options": [
    {
      "label": "Germany"
    },
    {
      "label": "United States"
    },
    {
      "label": "United Kingdom"
    }
  ]
}
```

### 10. DROPDOWN - Full (with custom values)

```json
{
  "label": "Choose your payment method",
  "type": "DROPDOWN",
  "isRequired": true,
  "position": 4,
  "placeholder": "Select payment method",
  "helpText": "Choose how you would like to pay for this event",
  "options": [
    {
      "label": "Credit Card",
      "value": "credit_card"
    },
    {
      "label": "PayPal",
      "value": "paypal"
    },
    {
      "label": "Bank Transfer",
      "value": "bank_transfer"
    },
    {
      "label": "Cash",
      "value": "cash"
    }
  ]
}
```

### 11. DATE - Minimal

```json
{
  "label": "What is your date of birth?",
  "type": "DATE"
}
```

### 16. DATE - Full

```json
{
  "label": "When would you like to attend?",
  "type": "DATE",
  "isRequired": true,
  "position": 8,
  "placeholder": "Select a date",
  "helpText": "Choose your preferred attendance date"
}
```

---

## Complete Event with Multiple Questions

Example payload for creating/updating an event with all question types:

```json
{
  "title": "Sample Event",
  "description": "Event description",
  "shortDescription": "Short description",
  "type": "WORKSHOP",
  "eventCategoryIds": ["category-uuid-1"],
  "eventTargetIds": ["target-uuid-1"],
  "maxCapacity": 50,
  "schedules": [
    {
      "date": "2026-02-15",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ],
  "questions": [
    {
      "label": "What is your full name?",
      "type": "SHORT_TEXT",
      "isRequired": true,
      "position": 0,
      "placeholder": "Enter your full name"
    },
    {
      "label": "Tell us about your background",
      "type": "LONG_TEXT",
      "isRequired": false,
      "position": 1,
      "helpText": "Share your professional background and interests"
    },
    {
      "label": "What is your experience level?",
      "type": "SINGLE_CHOICE",
      "isRequired": true,
      "position": 2,
      "options": [
        {
          "label": "Beginner",
          "value": "beginner"
        },
        {
          "label": "Intermediate",
          "value": "intermediate"
        },
        {
          "label": "Advanced",
          "value": "advanced"
        }
      ]
    },
    {
      "label": "Which topics interest you? (Select all that apply)",
      "type": "MULTI_CHOICE",
      "isRequired": false,
      "position": 3,
      "options": [
        {
          "label": "Web Development",
          "value": "web_dev"
        },
        {
          "label": "Mobile Development",
          "value": "mobile_dev"
        },
        {
          "label": "Data Science",
          "value": "data_science"
        },
        {
          "label": "Machine Learning",
          "value": "ml"
        }
      ]
    },
    {
      "label": "Select your preferred time slot",
      "type": "DROPDOWN",
      "isRequired": true,
      "position": 4,
      "options": [
        {
          "label": "Morning (9:00 - 12:00)",
          "value": "morning"
        },
        {
          "label": "Afternoon (13:00 - 16:00)",
          "value": "afternoon"
        },
        {
          "label": "Evening (17:00 - 20:00)",
          "value": "evening"
        }
      ]
    },
    {
      "label": "What is your preferred date?",
      "type": "DATE",
      "isRequired": false,
      "position": 6,
      "helpText": "Select your preferred attendance date"
    }
  ]
}
```

---

## Edge Cases and Special Scenarios

### Options with Same Label but Different Values

```json
{
  "label": "Select your region",
  "type": "DROPDOWN",
  "options": [
    {
      "label": "North",
      "value": "region_north"
    },
    {
      "label": "South",
      "value": "region_south"
    },
    {
      "label": "East",
      "value": "region_east"
    },
    {
      "label": "West",
      "value": "region_west"
    }
  ]
}
```

### Options Without Values (Value Defaults to Label)

```json
{
  "label": "Choose an option",
  "type": "SINGLE_CHOICE",
  "options": [
    {
      "label": "Yes"
    },
    {
      "label": "No"
    },
    {
      "label": "Maybe"
    }
  ]
}
```

### Question with Maximum Length Fields

```json
{
  "label": "A".repeat(500),
  "type": "SHORT_TEXT",
  "placeholder": "B".repeat(255),
  "helpText": "C".repeat(1000),
  "isRequired": true,
  "position": 0
}
```

### Question with Maximum Options (50 items)

```json
{
  "label": "Select from many options",
  "type": "MULTI_CHOICE",
  "options": Array.from({ length: 50 }, (_, i) => ({
    "label": `Option ${i + 1}`,
    "value": `option_${i + 1}`
  }))
}
```

### Optional Question (isRequired: false)

```json
{
  "label": "Additional comments (optional)",
  "type": "LONG_TEXT",
  "isRequired": false,
  "position": 10
}
```

### Required Question (isRequired: true)

```json
{
  "label": "Required field",
  "type": "SHORT_TEXT",
  "isRequired": true,
  "position": 0
}
```

### Question Without Position (Uses Array Index)

```json
{
  "label": "Question without explicit position",
  "type": "SHORT_TEXT"
}
```

---

## Validation Rules Summary

### Required Fields
- `label` - Must be a non-empty string (max 500 chars)
- `type` - Must be a valid EventQuestionType enum value

### Type-Specific Requirements
- `SINGLE_CHOICE`, `MULTI_CHOICE`, `DROPDOWN` - Must have at least one option in the `options` array
- Options must have unique values (value defaults to label if not provided)

### Position Validation
- Must be unique within the same event
- Must be >= 0
- If not provided, defaults to array index

### Array Limits
- Maximum 50 options per question
- Maximum 100 questions per event

---

## Notes for Frontend Implementation

1. **Type Handling**: Always validate the `type` field matches one of the enum values before sending
2. **Options Requirement**: For `SINGLE_CHOICE`, `MULTI_CHOICE`, and `DROPDOWN` types, ensure at least one option is provided
3. **Position Management**: If positions are not provided, the backend will use array indices. For explicit ordering, provide position values
4. **Option Values**: If `value` is not provided in an option, it defaults to the `label`. Ensure uniqueness if custom values are used
5. **Required Fields**: Only `label` and `type` are required. All other fields are optional
6. **Boolean Fields**: Use actual boolean values (`true`/`false`) not strings for `isRequired`
7. **Number Fields**: Use actual numbers not strings for `position`
