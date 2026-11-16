import { useEffect, useState } from "react";
import TeacherSidebar from "../../components/TeacherSidebar";
import "../../styles/CreateExam.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AfterLogout from "../../components/AfterLogout";


function CreateExam() {

    const [teacher, setTeacher] = useState(null);
    const [isNegativeMarkings, setIsNegativeMarkings] = useState(false);

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [error, setError] = useState("");


    // Fetch teacher data
    const fetchTeacherData = async () => {
        try {
            const response = await axios.get(
                "/api/v1/teacher/dashboard"
            );

            setTeacher(response.data.data);
            setIsAuthenticated(true);

        } catch (error) {
            console.error("Error while fetching data:", error);

            if (error.response?.status === 401) {
                setIsAuthenticated(false);
            } else {
                setError("Unable to load teacher information.");
            }

        } finally {
            setIsLoading(false);
        }
    };


    // Fetch teacher information on mount
    useEffect(() => {
        fetchTeacherData();
    }, []);


    // Exam data
    const [examData, setExamData] = useState({
        title: "",
        questions: [],
        timeLimit: 0,
        createdBy: "",
        totalQuestions: 0,
        password: "",
        questionMarks: 0,
        negativeMarks: 0,
    });


    // Questions
    const [questions, setQuestions] = useState([
        {
            id: 1,
            question: "",
            options: ["", "", "", ""],
            correctAnswer: null,
        },
    ]);


    // Handle exam input changes
    const handleExamChange = (e) => {
        const { name, value } = e.target;

        setExamData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    // Handle question changes
    const handleQuestionChange = (questionId, value) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? { ...question, question: value }
                    : question
            )
        );
    };


    // Handle option changes
    const handleOptionChange = (questionId, optionIndex, value) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? {
                        ...question,
                        options: question.options.map(
                            (option, index) =>
                                index === optionIndex ? value : option
                        ),
                    }
                    : question
            )
        );
    };


    // Handle correct answer
    const handleCorrectAnswer = (questionId, optionIndex) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? {
                        ...question,
                        correctAnswer: optionIndex,
                    }
                    : question
            )
        );
    };


    // Add question
    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                id: Date.now(),
                question: "",
                options: ["", "", "", ""],
                correctAnswer: null,
            },
        ]);
    };


    // Remove question
    const removeQuestion = (questionId) => {
        setQuestions((prev) => {
            if (prev.length === 1) {
                return prev;
            }

            return prev.filter(
                (question) => question.id !== questionId
            );
        });
    };


    // Submit exam
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        try {
            setIsSaving(true);

            const Edata = {
                examData: {
                    ...examData,
                    createdBy: teacher._id,
                    totalQuestions: questions.length,
                },
                questions,
            };

            const response = await axios.post(
                "/api/v1/teacher/create-exam",
                Edata
            );

            if (response.data.success) {
                navigate(`/teacher/${teacher.username}/dashboard`);
            }

        } catch (error) {
            console.error("Exam creation error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to create exam. Please try again."
            );

        } finally {
            setIsSaving(false);
        }
    };


    // Loading screen
    if (isLoading) {
        return (
            <div className="loading-data">
                <p>Loading.......</p>
            </div>
        );
    }


    // Authentication check
    if (!isAuthenticated) {
        return <AfterLogout role="teacher" />;
    }


    // Your create exam JSX below

    // console.log(error)
    return (
        <div className="create-exam-layout">
            <TeacherSidebar />

            <main className="create-exam-main">

                {/* HEADER */}
                <div className="create-exam-header">
                    <div>
                        <h1>Create New Exam</h1>
                        <p>
                            Create an MCQ examination for your students.
                        </p>
                    </div>

                    <div className="teacher-header-profile">

                        <div className="teacher-profile-avatar">
                            {teacher.fullName?.[0].toUpperCase()}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>


                    <section className="create-exam-section">

                        <div className="section-heading">

                            <div>
                                <h2>Exam Information</h2>
                                <p>
                                    Enter the basic information about your exam.
                                </p>
                            </div>
                        </div>


                        <div className="exam-form-grid">

                            {/* TITLE */}

                            <div className="form-group full-width">
                                <label>
                                    Exam Title <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Java Programming Fundamentals"
                                    value={examData.title}
                                    onChange={handleExamChange}
                                    required
                                />


                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group full-width">
                                <label>Description</label>

                                <textarea
                                    name="description"
                                    placeholder="Write a short description about this examination..."
                                    value={examData.description}
                                    onChange={handleExamChange}
                                    rows="4"
                                />
                            </div>


                            {/* DURATION */}

                            <div className="form-group">
                                <label>
                                    Duration <span>*</span>
                                </label>

                                <div className="input-with-unit">
                                    <input
                                        type="number"
                                        name="timeLimit"
                                        placeholder="30"
                                        min="1"
                                        value={examData.timeLimit}
                                        onChange={handleExamChange}
                                        required
                                    />

                                    <span>minutes</span>
                                </div>
                            </div>


                            {/* TOTAL MARKS */}

                            <div className="form-group">
                                <label>
                                    Total Marks <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    name="totalScore"
                                    placeholder="40"
                                    min="1"
                                    value={examData.totalScore}
                                    onChange={handleExamChange}
                                    required
                                />
                            </div>


                            {/* PASSWORD */}

                            <div className="form-group full-width">
                                <label>
                                    Exam Password <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="password"
                                    placeholder="Create a password for students"
                                    value={examData.password}
                                    onChange={handleExamChange}
                                    required
                                />

                                <small>
                                    Students will need this password before
                                    starting the examination.
                                </small>
                            </div>

                            <div className="form-group full-width">
                                <label>
                                    Marks per Question <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    name="questionMarks"
                                    placeholder="Enter marks per questions"
                                    value={examData.questionMarks}
                                    onChange={handleExamChange}
                                    required
                                />

                            </div>


                            <div className="form-group full-width">

                                <label>
                                    Allow Negative Markings <span>*</span>
                                </label>

                                <div className="radio-group">

                                    <label>
                                        <input
                                            type="radio"
                                            name="negativeMarkings"
                                            value="true"
                                            checked={isNegativeMarkings === true}
                                            onChange={() => setIsNegativeMarkings(true)}
                                        />
                                        Yes
                                    </label>

                                    <label>
                                        <input
                                            type="radio"
                                            name="negativeMarkings"
                                            value="false"
                                            checked={isNegativeMarkings === false}
                                            onChange={() => setIsNegativeMarkings(false)}
                                        />
                                        No
                                    </label>

                                </div>

                            </div>


                            {
                                isNegativeMarkings ? <div className="form-group full-width">
                                    <label>
                                        Enter Negative Marks <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="negativeMarks"
                                        placeholder="Enter negative marke"
                                        value={examData.negativeMarks}
                                        onChange={handleExamChange}
                                        required
                                        min="0"
                                        max={examData.questionMarks}
                                        step="0.5"
                                    />

                                </div> : null
                            }

                        </div>

                    </section>


                    {/* QUESTIONS */}

                    <section className="create-exam-section">

                        <div className="questions-header">

                            <div className="section-heading">


                                <div>
                                    <h2>Questions</h2>
                                    <p>
                                        Add multiple-choice questions for your exam.
                                    </p>
                                </div>
                            </div>

                            <span className="question-count">
                                {questions.length}{" "}
                                {questions.length === 1
                                    ? "Question"
                                    : "Questions"}
                            </span>

                        </div>


                        {/* QUESTION CARDS */}

                        <div className="questions-list">

                            {questions.map((question, questionIndex) => (

                                <div
                                    className="create-question-card"
                                    key={question.id}
                                >

                                    {/* QUESTION HEADER */}

                                    <div className="question-card-header">

                                        <div className="question-title">
                                            <span>
                                                Question {questionIndex + 1}
                                            </span>
                                        </div>

                                        {questions.length > 1 && (
                                            <button
                                                type="button"
                                                className="remove-question-btn"
                                                onClick={() =>
                                                    removeQuestion(question.id)
                                                }
                                            >
                                                Remove
                                            </button>
                                        )}

                                    </div>


                                    {/* QUESTION */}

                                    <div className="form-group">

                                        <label>
                                            Question <span>*</span>
                                        </label>

                                        <textarea
                                            placeholder="Enter your question..."
                                            rows="3"
                                            value={question.question}
                                            onChange={(e) =>
                                                handleQuestionChange(
                                                    question.id,
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />

                                    </div>


                                    {/* OPTIONS */}

                                    <div className="options-heading">
                                        <label>
                                            Options{" "}
                                            <span>*</span>
                                        </label>

                                        <small>
                                            Select the radio button for the correct answer.
                                        </small>
                                    </div>


                                    <div className="create-options">

                                        {question.options.map(
                                            (option, optionIndex) => (

                                                <div
                                                    className={`create-option ${question.correctAnswer ===
                                                        optionIndex
                                                        ? "correct-option"
                                                        : ""
                                                        }`}
                                                    key={optionIndex}
                                                >

                                                    <input
                                                        type="radio"
                                                        name={`correct-${question.id}`}
                                                        checked={
                                                            question.correctAnswer ===
                                                            optionIndex
                                                        }
                                                        onChange={() =>
                                                            handleCorrectAnswer(
                                                                question.id,
                                                                optionIndex
                                                            )
                                                        }

                                                    />

                                                    <span className="option-label">
                                                        {String.fromCharCode(
                                                            65 + optionIndex
                                                        )}
                                                    </span>

                                                    <input
                                                        type="text"
                                                        placeholder={`Option ${optionIndex + 1
                                                            }`}
                                                        value={option}
                                                        onChange={(e) =>
                                                            handleOptionChange(
                                                                question.id,
                                                                optionIndex,
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                    />

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                        {/* ADD QUESTION */}

                        <button
                            type="button"
                            className="add-question-btn"
                            onClick={addQuestion}
                        >
                            + Add Another Question
                        </button>

                        {error && (
                            <p className="password-error">
                                {error}
                            </p>
                        )}

                    </section>


                    {/* BOTTOM ACTIONS */}

                    <div className="create-exam-actions">

                        <button type="button" className="cancel-exam-btn"
                            onClick={() => {
                                navigate(`/teacher/${teacher.username}/dashboard`)
                            }}
                        >
                            Cancel
                        </button>

                        <button type="submit" className="create-exam-btn" >

                            Create Exam
                        </button>


                    </div>

                </form>


            </main>
        </div>
    );
}

export default CreateExam;