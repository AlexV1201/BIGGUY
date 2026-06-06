import { createBrowserRouter } from "react-router";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { FocusMode } from "./components/FocusMode";
import { Library } from "./components/Library";
import { DocumentReader } from "./components/DocumentReader";
import { AIStudyTools } from "./components/AIStudyTools";
import { Flashcards } from "./components/FlashcardsNew";
import { Quiz } from "./components/Quiz";
import { Evaluations } from "./components/Evaluations";
import { Profile } from "./components/Profile";

export const router = createBrowserRouter([
  {
    path: "/onboarding",
    Component: Onboarding,
  },
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/focus",
    Component: FocusMode,
  },
  {
    path: "/library",
    Component: Library,
  },
  {
    path: "/reader/:fileId",
    Component: DocumentReader,
  },
  {
    path: "/ai-tools",
    Component: AIStudyTools,
  },
  {
    path: "/flashcards",
    Component: Flashcards,
  },
  {
    path: "/quiz",
    Component: Quiz,
  },
  {
    path: "/evaluations",
    Component: Evaluations,
  },
]);
