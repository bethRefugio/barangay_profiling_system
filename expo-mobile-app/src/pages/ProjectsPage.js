import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';

const projects = [
  {
    title: "Barangay Health and Wellness Program",
    description: [
      "Establish a regular medical mission providing free check-ups, vaccinations, and consultations.",
      "Promote health awareness campaigns on hygiene, nutrition, and disease prevention.",
      "Set up a community pharmacy with affordable medicines for residents.",
    ],
    image: require('../../assets/health and wellness.jpg'),
  },
  {
    title: "Livelihood and Skills Development Program",
    description: [
      "Conduct training on handicrafts, urban gardening, and small-scale entrepreneurship.",
      "Partner with local businesses to provide job opportunities and apprenticeships.",
      "Provide microfinance assistance for small businesses and cooperatives.",
    ],
    image: require('../../assets/livelihood and skills.jpg'),
  },
  {
    title: "Environmental Conservation and Clean-Up Drive",
    description: [
      "Implement a solid waste management program, including segregation and recycling initiatives.",
      "Organize tree-planting activities to enhance green spaces and prevent soil erosion.",
      "Conduct regular barangay-wide clean-up drives to promote cleanliness and sanitation.",
    ],
    image: require('../../assets/clean-up drive.jpg'),
  },
  {
    title: "Youth and Education Development Program",
    description: [
      "Offer free tutoring and scholarship assistance for underprivileged students.",
      "Establish a barangay library or learning hub with access to books and digital resources.",
      "Conduct leadership and skills training programs for youth empowerment.",
    ],
    image: require('../../assets/youth program.jpg'),
  },
  {
    title: "Disaster Preparedness and Response Program",
    description: [
      "Develop an early warning system and evacuation plan for natural disasters.",
      "Train barangay responders in first aid, firefighting, and rescue operations.",
      "Organize disaster drills and community awareness seminars to enhance preparedness.",
    ],
    image: require('../../assets/disaster-preparedness-program.jpg'),
  },
];

const ProjectsPage = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Barangay Projects</Text>
      {projects.map((project, index) => (
        <View key={index} style={styles.projectCard}>
          <View style={styles.projectDetails}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <View style={styles.imageAndDetails}>
              <Image source={project.image} style={styles.projectImage} />
              <View style={styles.descriptionContainer}>
                {project.description.map((item, idx) => (
                  <Text key={idx} style={styles.projectDescription}>• {item}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  projectCard: { flexDirection: 'row', marginBottom: 20, backgroundColor: 'rgba(55, 65, 81, 0.8)', borderRadius: 10, padding: 10, alignItems: 'center' },
  projectImage: { width: 300, height: 150, borderRadius: 10, marginLeft: 10 },
  projectDetails: { flex: 1 },
  projectTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 8 , alignItems: 'center'},
  imageAndDetails: { flexDirection: 'column', alignItems: 'center' },
  descriptionContainer: { marginTop: 8 , alignItems: 'center' },
  projectDescription: { color: '#ccc', fontSize: 14, marginBottom: 4, alignItems: 'center' },
});

export default ProjectsPage;
