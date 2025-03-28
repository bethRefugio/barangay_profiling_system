import React from 'react';
import Header from "../components/common/Header";
import { motion } from 'framer-motion';

const projects = [
    {
        title: "Barangay Health and Wellness Program",
        description: [
            "Establish a regular medical mission providing free check-ups, vaccinations, and consultations.",
            "Promote health awareness campaigns on hygiene, nutrition, and disease prevention.",
            "Set up a community pharmacy with affordable medicines for residents.",
        ],
        image: "/health and wellness.jpg", // Replace with the actual image path
    },
    {
        title: "Livelihood and Skills Development Program",
        description: [
            "Conduct training on handicrafts, urban gardening, and small-scale entrepreneurship.",
            "Partner with local businesses to provide job opportunities and apprenticeships.",
            "Provide microfinance assistance for small businesses and cooperatives.",
        ],
        image: "/livelihood and skills.jpg", // Replace with the actual image path
    },
    {
        title: "Environmental Conservation and Clean-Up Drive",
        description: [
            "Implement a solid waste management program, including segregation and recycling initiatives.",
            "Organize tree-planting activities to enhance green spaces and prevent soil erosion.",
            "Conduct regular barangay-wide clean-up drives to promote cleanliness and sanitation.",
        ],
        image: "/clean-up drive.jpg", // Replace with the actual image path
    },
    {
        title: "Youth and Education Development Program",
        description: [
            "Offer free tutoring and scholarship assistance for underprivileged students.",
            "Establish a barangay library or learning hub with access to books and digital resources.",
            "Conduct leadership and skills training programs for youth empowerment.",
        ],
        image: "/youth program.jpg", // Replace with the actual image path
    },
    {
        title: "Disaster Preparedness and Response Program",
        description: [
            "Develop an early warning system and evacuation plan for natural disasters.",
            "Train barangay responders in first aid, firefighting, and rescue operations.",
            "Organize disaster drills and community awareness seminars to enhance preparedness.",
        ],
        image: "/disaster-preparedness-program.jpg", // Replace with the actual image path
    },
];

const ProjectsPage = () => {
    return (
        <div className="flex-1 overflow-auto relative z-10">
             <Header title='Barangay Projects' />


            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        className="flex items-center bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                    >
                        {/* Project Image */}
                        <div className="w-1/3">
                            <img
                                src={project.image}
                                alt={project.title}
                                className="rounded-lg shadow-md"
                            />
                        </div>

                        {/* Project Details */}
                        <div className="w-2/3 pl-6">
                            <h2 className="text-xl font-semibold text-gray-100 mb-4">{project.title}</h2>
                            <ul className="list-disc list-inside text-gray-300">
                                {project.description.map((item, idx) => (
                                    <li key={idx} className="mb-2">{item}</li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}
            </main>
        </div>
    );
};

export default ProjectsPage;