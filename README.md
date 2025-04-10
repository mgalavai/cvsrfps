# Candidate-RFP Matching Application

## Description

This application provides a platform for efficiently matching candidate CVs (Curriculum Vitae) with RFPs (Requests for Proposals) or job requirements. It streamlines the process of identifying suitable candidates for specific roles by analyzing CV content against RFP keywords and calculating match scores.

The interface allows users to manage lists of candidates and requirements, view detailed information, and trigger an automated matching process to see the best fits.

## Features

- **CV & RFP Management:** Upload, view, and manage lists of candidate CVs and RFPs.
- **Integrated Matching:** Automatically compare selected CVs and RFPs based on content similarity and keyword relevance.
- **Detailed Views:** Open drawers/sheets to view the full content of individual CVs and RFPs.
- **Keyword Highlighting:** (Future feature) Visualize matched keywords within CV and RFP content.
- **Pitch Generation:** (Future feature) Generate tailored pitch documents based on successful matches.
- **Responsive UI:** Modern user interface built with React and Tailwind CSS for usability across devices.
- **Navigation:** Sticky header with tab-based navigation for easy access to different sections.
- **Customizable Components:** Utilizes shadcn/ui for adaptable and themeable UI components.

## Tech Stack

- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (built on Radix UI)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mgalavai/cvsrfps
    cd cvsrfps
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1.  **Add Candidates & Requirements:** Use the respective sections to upload or input CVs and RFPs.
2.  **Select Items:** Check the boxes next to the CVs and RFPs you want to compare.
3.  **Initiate Matching:** Click the "Match Selected" button (visible when items are selected) to generate match results.
4.  **View Results:** The "Results" section will display matched pairs, scores, and relevant keywords.
5.  **Explore Details:** Click on CV or RFP names to open a detailed view in a side drawer.

## Contributing

Contributions are welcome! Please follow standard Git workflow (fork, branch, pull request) for contributing. (Add more specific contribution guidelines if needed).

## License

(Specify your license here, e.g., MIT License)