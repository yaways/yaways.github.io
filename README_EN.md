# Calculator_for_Timesheet

## **A tool for automatically calculating project person-day costs. Adapted for China's unique holiday adjustments, with Excel export support.**

## Project Overview

A person-day cost assessment tool designed for project management and cost estimation. This application helps organizations calculate consultant costs based on work schedules, taking into account holidays, working days, and different resource types.

## Key Features

### 1. Project Configuration

Set project year, start month, and duration (1-36 months).
Configure statutory holidays and make-up working days using an intuitive date picker.
Uses Flatpickr for date management, automatically detecting conflicts between holidays and working days.

### 2. Resource Management

Preset consultant types: FICO, PP, MM, SD, HR, ABAP, BASIS consultants.
Supports custom consultant types.
Dynamically add/remove resource rows.
Set unit price and remarks for each resource.

### 3. Working Day Calculation

Automatically calculate weekly working days (excluding weekends and holidays).
Supports adding make-up working days (adjusted workdays).
Displays the number of working days per week.

### 4. Cost Calculation

Real-time calculation of person-day subtotals for each resource.
Calculate total price per resource (Person-days × Unit Price).
Displays total project cost.
Grand total for all resources.

### 5. Data Persistence

Uses localStorage to save project data.
Data is retained after page refresh.

### 6. Excel Export

Uses the ExcelJS library to export complete cost assessment tables.
Includes formatted tables and remarks.
Automatically adjusts column widths and styles.

## Technical Architecture

The project adopts a classic three-layer architecture:

* HTML: Semantic HTML5 structure containing project configuration forms and table containers.
* CSS: Uses CSS variables for theme management, responsive design, and smooth transition animations.
* JavaScript: Modular design, including language management system, date handling, and dynamic DOM manipulation.

## Technical Highlights

Flatpickr: For intuitive date selection.
ExcelJS: For generating professional Excel export files.
FileSaver.js: For client-side file saving.
localStorage: For client-side data persistence.

## UI Design

Responsive design with horizontal scrolling support.
Fixed header and first column for easy viewing of large tables.
Modern UI design using card layout.
Zebra-striped tables to improve readability.
Supports Light and Dark themes.
Smooth theme switching transitions.
Uses localStorage to persist theme preferences.

## Data Processing

Intelligent working day calculation algorithm.
Real-time cost calculation and aggregation.
Flexible resource configuration management.

## This tool is a well-designed, professional-grade project cost assessment instrument, with careful consideration given to usability, internationalization, and professional presentation. The implementation demonstrates good practices in modern Web development, including responsive design, accessibility considerations, and efficient client-side data management.