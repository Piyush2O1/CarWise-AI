import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AnalysisPreview from "../components/AnalysisPreview";
import Footer from "../components/Footer";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import CTA from "../components/CTA";
import Metrics from "../components/Metrics";
import ReportPreview from "../components/ReportPreview";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";


function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }

      setFile(selectedFile);
      setError("");
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login before analyzing a contract");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysis(null);

      const formData = new FormData();
      formData.append("contract", file);

      const uploadResponse = await api.post(
        "/contracts/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contractId = uploadResponse.data.contract._id;

      const analysisResponse = await api.post(
        `/contracts/${contractId}/analyze`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalysis(analysisResponse.data.analysis);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        setError("Session expired. Please login again.");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const focusUpload = () => {
    document.getElementById("contract-file")?.click();
  };

  return (
    <div className="app">

     <Navbar />

      <main>
        <section className="hero">
          <HeroSection
            file={file}
            handleFileChange={handleFileChange}
            handleAnalyze={handleAnalyze}
            loading={loading}
            error={error}
            focusUpload={focusUpload}
          />
          <AnalysisPreview analysis={analysis} />
        </section>

        <Metrics />
        <HowItWorks />
        <Features />
        <ReportPreview />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>

      <Footer />

    </div>
  );
}

export default Home;