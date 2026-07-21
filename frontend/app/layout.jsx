import "../src/index.css";

export const metadata = {
  title: "Micro-ATS | Smart Interview Scheduler",
  description: "A compact interview scheduling dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
