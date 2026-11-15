import { useEffect, useState } from "react";
import TeacherSidebar from "../../components/TeacherSidebar";
import "../../styles/CreateExam.css";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import AfterLogout from "../../components/AfterLogout";


function EditExam() {
    const { examId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [teacher, setTeacher] = useState({});
    const [isNegativeMarkings, setIsNegativeMarkings] = useState(true);
    const navigate = useNavigate()
    const [exam, setExam] = useState({});
    const [error, setError] = useState("");

    const fetchTeacherData = async () => {

        try {

            const response = await axios.get(`/api/v1/teacher/dashboard`);
            setTeacher(response.data.data);
        } catch (error) {
            console.error("Error while fetching Data  ",error)
        }
    }

    const fetchExam = async () => {
        try {
            const response = await axios.get(
                `/api/v1/teacher/get-exam/${examId}`
            );

            const exam = response.data.data;

            setExam(exam);

            setExamData({
                _id:exam?._id,
                title: exam.title || "",
                description: exam.description || "",
                timeLimit: exam.timeLimit || 30,
                totalScore: exam.totalScore || 0,
                password: "",
                questionMarks: exam.questionMarks ?? 4,
                negativeMarks: exam.negativeMarks ?? 0,
            });

            setIsNegativeMarkings(
                exam.negativeMarks > 1
            );

            setQuestions(
                exam.questions.map((question, index) => ({
                    ...question,
                    id: question._id || Date.now() + index,
                    options: [...question.options],
                }))
            );

        } catch (error) {
            console.error("Error fetching exam:", error);
            setError(
                error.response?.data?.message || "Failed to load exam."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeacherData();
        fetchExam();
    }, [examId])

    const [examData, setExamData] = useState({
        _id:"",
        title: "",
        description: "",
        timeLimit: 30,
        totalScore: 0,
        password: "",
        questionMarks: 4,
        negativeMarks: 0,
    });

    const [questions, setQuestions] = useState([
        {
            id: 1,
            question: "",
            options: ["", "", "", ""],
            correctAnswer:null,
        },
    ]);

    const handleExamChange = (e) => {
        const { name, value } = e.target;

        setExamData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleQuestionChange = (questionId, value) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId ? { ...question, question: value, } : question
            )
        );
    };

    const handleNegativeMarking = (value) => {
        setIsNegativeMarkings(value);

        if (!value) {
            setExamData((prev) => ({
                ...prev,
                negativeMarks: 0,
            }));
        }
    };

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

    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                id: Date.now(),
                question: "",
                options: ["", "", "", ""],
                correctAnswer: "",
            },
        ]);
    };

    const removeQuestion = (questionId) => {
        if (questions.length === 1) {
            return;
        }

        setQuestions((prev) =>
            prev.filter(
                (question) => question.id !== questionId
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const Edata = {
                examData: {
                    ...examData,
                    negativeMarkings: isNegativeMarkings,
                    createdBy: teacher._id,
                },
                questions: questions,
            };

            // If password is empty, don't change the existing password
            if (!examData.password) {
                delete Edata.examData.password;
            }

            const response = await axios.post(
                `/api/v1/teacher/edit-exam/${examId}`,
                Edata
            );

            navigate(`/teacher/${teacher.username}/my-exams`);

        } catch (error) {
            setError(
                error.response?.data?.message || "Failed to update exam."
            );
        }
    };

    // console.log(error)
    if (isLoading) {
        return <div className="loading">Loading exam details...</div>;
    }

    if (!teacher.username && !isLoading) {
        return <AfterLogout role="teacher" />;
    }
    return (
        <div className="create-exam-layout">
            <TeacherSidebar />

            <main className="create-exam-main">

                {/* HEADER */}
                <div className="create-exam-header">
                    <div>
                        <h1>Edit Exam</h1>
                        <p>Update your examination details and questions.</p>
                    </div>

                    <div className="teacher-profile">

                        <div className="teacher-avatar">
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
                                    type="password"
                                    name="password"
                                    placeholder="Enter a new password (leave blank to keep current)"
                                    value={examData.password}
                                    onChange={handleExamChange}
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
                                            checked={isNegativeMarkings === true}
                                            onChange={() => handleNegativeMarking(true)}
                                        />
                                        Yes
                                    </label>

                                    <label>
                                        <input
                                            type="radio"
                                            name="negativeMarkings"
                                            checked={isNegativeMarkings === false}
                                            onChange={() => handleNegativeMarking(false)}
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

                        <button
                            type="button"
                            className="cancel-exam-btn"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="create-exam-btn"
                        >
                            Update Exam
                        </button>


                    </div>

                </form>


            </main>
        </div>
    );
}

export default EditExam;