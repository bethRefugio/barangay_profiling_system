import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { UserCheck, UserPlus, UsersIcon, UserX, User } from "lucide-react";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import EventsTable from "../components/events/EventsTable";


const EventsPage = () => {
    const [events, setEvents] = useState([]);
    
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:5000/events');
                const data = await response.json();
                setEvents(data);

            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Events' />

            <main className='max-w-7xl mx-auto py-6 px-3 lg:px-8'>
                <EventsTable />

            </main>
        </div>
    );
};

export default EventsPage;