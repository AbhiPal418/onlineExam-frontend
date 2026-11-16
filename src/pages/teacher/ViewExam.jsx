
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import TeacherSidebar from "../../components/TeacherSidebar";
import AfterLogout from "../../components/AfterLogout";
import "../../styles/ViewExam.css";

function ViewExam() {


    // ---------------- STATES ----------------

    const { examId } = useParams();

    const navigate = useNavigate();

    const [exam, setExam] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState("");

    const [authStatus, setAuthStatus] = useState("loading");


    // ---------------- FETCH EXAM DETAILS ----------------

    useEffect(() => {

        const controller = new AbortController();

        const fetchExam = async () => {

            try {

                setIsLoading(true);

                setExam(null);

                setError("");

                setAuthStatus("loading");

                const response = await axios.get(
                    `/api/v1/teacher/get-exam/${examId}`,
                    {
                        signal: controller.signal
                    }
                );

                const examData =
                    response.data.data?.exam ??
                    response.data.data;

                if (!examData) {
                    throw new Error("Exam details not found.");
                }

                setExam(examData);

                setAuthStatus("authenticated");

            } catch (error) {

                if (error.code === "ERR_CANCELED") {
                    return;
                }

                console.error("Error fetching exam:", error);

                if (error.response?.status === 401) {

                    setExam(null);
                    setAuthStatus("unauthenticated");

                } else {

                    setError(
                        error.response?.data?.message ||
                        error.message ||
                        "Unable to fetch exam details."
                    );

                    setAuthStatus("authenticated");
                }

            } finally {

                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }

            }

        };


        if (!examId) {

            setError("Invalid exam ID.");

            setAuthStatus("authenticated");

            setIsLoading(false);

        } else {

            fetchExam();

        }


        return () => {
            controller.abort();
        };

    }, [examId]);


    // ---------------- CALCULATE TOTAL MARKS ----------------

    const totalMarks = (
        Number(exam?.totalQuestion ?? exam?.questions?.length ?? 0) *
        Number(exam?.questionMarks ?? 0)
    );


    // ---------------- CHECK CORRECT OPTION ----------------

    const isCorrectOption = (question, option, index) => {

        const correctAnswer = question?.correctAnswer;

        // If correctAnswer is an index
        if (typeof correctAnswer === "number") {
            return correctAnswer === index;
        }

        // If correctAnswer is stored as option text
        if (typeof correctAnswer === "string") {

            return (
                correctAnswer.trim().toLowerCase() ===
                String(option).trim().toLowerCase()
            );
        }

        return false;

    };


    // ---------------- CONDITIONAL RENDERING ----------------

    // Loading
    if (isLoading || authStatus === "loading") {

        return (
            <div className="loading-data">
                <p>Loading exam details...</p>
            </div>
        );

    }


    // Authentication failure
    if (authStatus === "unauthenticated") {

        return <AfterLogout role="teacher" />;

    }


    // API error
    if (error || !exam) {

        return (
            <div className="loading-data">

                <p>{error || "Exam not found."}</p>

                <button onClick={() => navigate(-1)}>
                    Go Back
                </button>

            </div>
        );

    }


    // Your existing exam details JSX goes below

    // Loading screen
    if (isLoading) {
        return (
            <div className="teacher-page">

                <TeacherSidebar />

                <main className="teacher-main view-exam-main">

                    <div className="view-exam-message">
                        <p>Loading exam details...</p>
                    </div>

                </main>

            </div>
        );
    }


    // Error screen
    if (error || !exam) {
        return (
            <div className="teacher-page">

                <TeacherSidebar />

                <main className="teacher-main view-exam-main">

                    <div className="view-exam-message">

                        <h2>Unable to Load Exam</h2>

                        <p>
                            {error || "Exam not found."}
                        </p>

                        <button
                            className="back-to-exams-btn"
                            onClick={() => navigate(-1)}
                        >
                            Back to My Exams
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    return (

        <div className="teacher-page">

            <TeacherSidebar />

            <main className="teacher-main view-exam-main">


                {/* Page Header */}
                <div className="view-exam-header">
                    <div className="">
                        <button
                            className="back-to-exams-btn"
                            onClick={() => navigate(-1)}
                        >
                            ← Back to My Exams
                        </button>
                    </div>
                    <div>



                        <h1>{exam.title}</h1>

                        <p>
                            View exam details and all questions.
                        </p>

                    </div>

                </div>


                {/* Exam Information */}
                <div className="view-exam-info-card">

                    <div className="view-exam-info-item">


                        <div>
                            <strong>
                                {exam.totalQuestion || exam.questions?.length || 0}
                            </strong>

                            <span>Total Questions</span>
                        </div>

                    </div>


                    <div className="view-exam-info-item">


                        <div>
                            <strong>
                                {exam.timeLimit || 0} Minutes
                            </strong>

                            <span>Exam Duration</span>
                        </div>

                    </div>


                    <div className="view-exam-info-item">


                        <div>
                            <strong>{totalMarks}</strong>

                            <span>Total Marks</span>
                        </div>

                    </div>


                    <div className="view-exam-info-item">


                        <div>
                            <strong>
                                {exam.totalAttempts ?? 0}
                            </strong>

                            <span>Total Attempts</span>
                        </div>

                    </div>

                </div>


                {/* Question Section */}
                <div className="view-exam-questions-card">

                    <div className="view-exam-questions-header">

                        <div>
                            <h2>Exam Questions</h2>

                            <p>
                                Review all questions and their correct answers.
                            </p>
                        </div>

                        <span className="question-count">
                            {exam.questions?.length || 0} Questions
                        </span>

                    </div>


                    {exam.questions?.length > 0 ? (

                        <div className="view-exam-question-list">

                            {exam.questions.map((question, index) => (

                                <div
                                    className="view-exam-question"
                                    key={question._id || index}
                                >

                                    {/* Question Header */}
                                    <div className="view-question-top">

                                        <span className="question-number">
                                            Question {index + 1}
                                        </span>

                                        <span className="question-marks">
                                            {exam.questionMarks || 0} Marks
                                        </span>

                                    </div>


                                    {/* Question Text */}
                                    <h3>
                                        {question.question ||
                                            question.questionText ||
                                            "Question text unavailable"}
                                    </h3>


                                    {/* Options */}
                                    <div className="view-exam-options">

                                        {question.options?.map((option, optionIndex) => {

                                            const correct = isCorrectOption(
                                                question,
                                                option,
                                                optionIndex
                                            );

                                            return (

                                                <div
                                                    key={optionIndex}
                                                    className={`view-exam-option ${correct ? "correct-option" : ""
                                                        }`}
                                                >

                                                    <span className="option-label">
                                                        {String.fromCharCode(65 + optionIndex)}
                                                    </span>

                                                    <span className="option-text">
                                                        {option}
                                                    </span>

                                                    {correct && (

                                                        <span className="correct-answer-label">
                                                            ✓ Correct Answer
                                                        </span>

                                                    )}

                                                </div>

                                            );

                                        })}

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <div className="view-exam-message">
                            <h3>No Questions Available</h3>
                            <p>This exam does not contain any questions.</p>
                        </div>

                    )}

                </div>


            </main>

        </div>

    );

}

export default ViewExam;
