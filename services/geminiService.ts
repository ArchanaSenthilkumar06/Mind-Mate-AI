import { GoogleGenAI, Type } from "@google/genai";
import type { Preferences, StudyPlan } from '../types';

const quizQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING, description: "The quiz question text." },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 4 possible answers."
        },
        correctAnswerIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the options array." },
        explanation: { type: Type.STRING, description: "A brief explanation of why the correct answer is right." }
    },
    required: ["question", "options", "correctAnswerIndex", "explanation"]
};

const studyTopicSchema = {
    type: Type.OBJECT,
    properties: {
        topicName: { type: Type.STRING, description: "The main topic name, e.g., 'Introduction to Quantum Computing'." },
        description: { type: Type.STRING, description: "A brief, one-sentence description of the topic." },
        subTopics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key sub-topics or concepts within this main topic."
        },
        youtubeLinks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the YouTube video." },
                    url: { type: Type.STRING, description: "The full URL of the YouTube video." }
                },
                required: ["title", "url"]
            },
            description: "A list of 2-3 relevant YouTube video links for the topic."
        },
        quiz: {
            type: Type.ARRAY,
            items: quizQuestionSchema,
            description: "An array of 3-4 multiple-choice quiz questions for this topic."
        }
    },
    required: ["topicName", "description", "subTopics", "youtubeLinks", "quiz"]
};

const studyScheduleItemSchema = {
    type: Type.OBJECT,
    properties: {
        day: { type: Type.STRING, description: "The day for the study activities, e.g., 'Day 1' or 'Monday'." },
        activities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of specific, actionable study activities for that day, referencing the topic names."
        },
    },
    required: ["day", "activities"]
};

const studyPlanSchema = {
    type: Type.OBJECT,
    properties: {
        courseName: { type: Type.STRING, description: "The name of the course derived from the syllabus." },
        difficulty: { type: Type.STRING, description: "The estimated difficulty of the course (e.g., 'Beginner', 'Medium', 'Advanced')." },
        topics: {
            type: Type.ARRAY,
            items: studyTopicSchema,
            description: "A detailed breakdown of all topics from the syllabus."
        },
        schedule: {
            type: Type.ARRAY,
            items: studyScheduleItemSchema,
            description: "A weekly or daily study schedule based on the user's preferences."
        }
    },
    required: ["courseName", "difficulty", "topics", "schedule"]
};

export async function generateStudyPlan(syllabusText: string, preferences: Preferences): Promise<Omit<StudyPlan, 'id' | 'userId' | 'completedTopics'>> {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
            You are an expert academic advisor AI. Your task is to create a personalized study plan from a course syllabus.
            Analyze the following syllabus text and user preferences, then generate a structured study plan in JSON format.

            **Syllabus Text:**
            ---
            ${syllabusText}
            ---

            **User Preferences:**
            - Study Frequency: ${preferences.studyFrequency}
            - Session Length: ${preferences.sessionLength} per session
            - Learning Style: ${preferences.learningStyle}

            **Instructions:**
            1.  **Extract Course Name:** Identify the main course title.
            2.  **Determine Difficulty:** Assess the syllabus content and assign a difficulty level (e.g., 'Beginner', 'Medium', 'Advanced').
            3.  **Break Down Topics:** Deconstruct the syllabus into a list of main topics. For each topic:
                a. Provide a short description and list key sub-topics.
                b. Find 2-3 high-quality, relevant YouTube video links (e.g., from educational channels like Khan Academy, 3Blue1Brown, freeCodeCamp, university lectures) that would help a student understand the material. Provide a title and full URL for each video.
                c. Create a small quiz with 3-4 multiple-choice questions. Each question must have 4 options, a 0-indexed integer for the correct answer, and a brief explanation for why the answer is correct.
            4.  **Create a Schedule:** Generate a logical study schedule (e.g., weekly or daily) based on the topics and user preferences. The schedule should be practical and distribute the workload evenly. Make the activities specific and actionable (e.g., "Review 'Quantum Entanglement' sub-topics and watch the recommended videos.").

            Your output must be a JSON object that strictly adheres to the provided schema.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: studyPlanSchema,
            },
        });
        
        const planText = response.text;
        const plan = JSON.parse(planText);

        // Basic validation
        if (!plan.courseName || !plan.topics || !plan.schedule || !plan.difficulty) {
            throw new Error("Generated plan is missing required fields.");
        }

        return plan;
    } catch (error) {
        console.error("Error generating study plan with Gemini:", error);
        throw new Error("The AI failed to generate a study plan. This might be due to an issue with the syllabus text or API connectivity. Please try again.");
    }
}