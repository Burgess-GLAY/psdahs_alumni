# Accessibility Features

This document outlines the accessibility features implemented in the PSDAHS Alumni application, specifically for the authentication system.

## Overview

The application follows WCAG 2.1 Level AA standards to ensure accessibility for all users, including those using assistive technologies like screen readers and keyboard-only navigation.

## Implemented Features

### 1. Keyboard Navigation

#### AuthModal
- **Tab Navigation**: Users can navigate through all interactive elements using Tab and Shift+Tab
- **ESC Key**: Pressing ESC closes the modal and restores focus to the trigger element
- **Focus Trapping**: Focus is trapped within the modal when open, preventing users from tabbing to elements behind the modal
- **Focus Restoration**: When the modal closes, focus is automatically restored to the element that opened it

#### Forms
- **Tab Order**: All form fields follow a logical tab order
- **Enter Key**: Pressing Enter in any field submits the form
- **Password Toggle**: Password visibility toggle buttons are keyboard accessible with Tab and Enter/Space

### 2. ARIA Labels and Roles

#### AuthModal
- `role="dialog"`: Identifies the modal as a dialog
- `aria-modal="true"`: Indicates the modal is modal (blocks interaction with background)
- `aria-labelledby`: Links to the modal title for screen readers
- `aria-describedby`: Links to the modal description

#### Form Fields
- `aria-label`: Descriptive labels for all input fields
- `aria-required`: Indicates required fields
- `aria-invalid`: Indicates fields with validation errors
- `aria-describedby`: Links error messages to their respective fields
- `role="alert"`: Error messages are announced immediately by screen readers

#### Buttons
- Descriptive `aria-label` attributes for all buttons
- Loading states are announced (e.g., "Signing in, please wait")
- Icon buttons have clear labels (e.g., "Show password", "Hide password")

### 3. Screen Reader Support

#### Announcements
- **Form Errors**: Validation errors are announced immediately using `role="alert"`
- **Loading States**: Loading indicators include aria-labels for screen reader users
- **Success Messages**: Success notifications are announced via the notification system

#### Form Labels
- All form fields have associated labels
- Helper text provides additional context
- Error messages are linked to their fields via `aria-describedby`

### 4. Color Contrast

The application uses Material-UI's default theme, which meets WCAG AA standards:
- **Normal Text**: Minimum contrast ratio of 4.5:1
- **Large Text**: Minimum contrast ratio of 3:1
- **Interactive Elements**: Clear visual focus indicators

#### Theme Colors
- Primary: Blue (#1976d2) - sufficient contrast on white backgrounds
- Error: Red (#d32f2f) - sufficient contrast for error messages
- Text: Dark gray (#000000de) - high contrast on white backgrounds

### 5. Focus Management

#### Visual Focus Indicators
- All interactive elements have visible focus indicators
- Focus indicators use Material-UI's default outline style
- Focus is clearly visible on all form fields, buttons, and links

#### Focus Order
- Focus follows a logical reading order (top to bottom, left to right)
- Tab order matches visual layout
- No focus traps except within the modal (intentional)

## Testing Guidelines

### Keyboard Navigation Testing

1. **Open Modal**
   - Click "Login" or "Sign Up" button
   - Verify focus moves into the modal
   - Verify you cannot tab to elements behind the modal

2. **Navigate Form**
   - Press Tab to move through all fields
   - Press Shift+Tab to move backwards
   - Verify tab order is logical
   - Verify all interactive elements are reachable

3. **Close Modal**
   - Press ESC key
   - Verify modal closes
   - Verify focus returns to the button that opened the modal

4. **Submit Form**
   - Fill out form using only keyboard
   - Press Enter to submit
   - Verify form submits successfully

### Screen Reader Testing

#### Recommended Tools
- **NVDA** (Windows) - Free
- **JAWS** (Windows) - Commercial
- **VoiceOver** (macOS/iOS) - Built-in
- **TalkBack** (Android) - Built-in

#### Test Scenarios

1. **Modal Opening**
   - Activate "Login" button
   - Verify screen reader announces: "Sign in to PSDAHS Alumni, dialog"
   - Verify modal role and title are announced

2. **Form Navigation**
   - Navigate through form fields
   - Verify each field's label is announced
   - Verify required status is announced
   - Verify field type is announced (e.g., "email", "password")

3. **Error Handling**
   - Submit form with invalid data
   - Verify errors are announced immediately
   - Verify error messages are associated with fields
   - Navigate to error field and verify error is announced

4. **Loading States**
   - Submit form
   - Verify loading state is announced (e.g., "Signing in, please wait")
   - Verify button is announced as disabled

5. **Success Flow**
   - Complete successful login
   - Verify success message is announced
   - Verify modal closes
   - Verify focus is restored

### Color Contrast Testing

#### Tools
- **Chrome DevTools**: Lighthouse accessibility audit
- **WAVE**: Web accessibility evaluation tool
- **Contrast Checker**: Online contrast ratio calculator

#### Test Steps
1. Run Lighthouse accessibility audit
2. Verify all text meets minimum contrast ratios
3. Check error messages have sufficient contrast
4. Verify focus indicators are visible

### Manual Accessibility Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and follows visual layout
- [ ] ESC key closes modal and restores focus
- [ ] All form fields have labels
- [ ] Required fields are marked with aria-required
- [ ] Error messages are linked to fields with aria-describedby
- [ ] Error messages use role="alert" for immediate announcement
- [ ] Loading states are announced to screen readers
- [ ] Password toggle buttons have descriptive labels
- [ ] All buttons have descriptive aria-labels
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible on all interactive elements
- [ ] Modal has proper ARIA attributes (role, aria-modal, aria-labelledby)
- [ ] Screen reader announces all important state changes

## Known Limitations

1. **Google Login Button**: Third-party component may have limited accessibility customization
2. **Password Strength Indicator**: Visual only, consider adding screen reader announcements
3. **Graduation Year Dropdown**: Long list may be cumbersome for screen reader users

## Future Improvements

1. **Live Regions**: Add aria-live regions for dynamic content updates
2. **Skip Links**: Add skip navigation links for keyboard users
3. **High Contrast Mode**: Test and optimize for Windows High Contrast Mode
4. **Reduced Motion**: Respect prefers-reduced-motion media query
5. **Password Strength**: Add screen reader announcements for password strength
6. **Form Progress**: Announce form completion progress for multi-step forms

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material-UI Accessibility](https://mui.com/material-ui/guides/accessibility/)
- [MDN ARIA Best Practices](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

## Contact

For accessibility issues or suggestions, please contact the development team or file an issue in the project repository.
