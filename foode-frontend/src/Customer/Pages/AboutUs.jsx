import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Component/Navbar'; // Adjust path as needed
import { Truck, Clock, Heart, Award, Utensils, Smile } from 'lucide-react';
import './css/AboutUs.css';
import cookingImg from '../asset/cooking.jpg';

export default function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="about-page">
            <Navbar />

            {/* 1. Hero Section */}
            <div className="about-hero">
                <div className="about-hero-content">
                    <h1>We Don't Just Deliver Food, <br /> We Deliver <span>Happiness</span>.</h1>
                    <p>From local kitchens to your dining table, we bridge the gap between hunger and satisfaction.</p>
                </div>
            </div>

            {/* 2. Our Story Section */}
            <section className="about-story-section">
                <div className="story-container">
                    <div className="story-image">
                        <img
                            src={cookingImg} // 2. Use the variable here
                            alt="Our Team Cooking"
                        />
                    </div>
                    <div className="story-text">
                        <h4>OUR STORY</h4>
                        <h2>Cooking Up Something Special</h2>
                        <p>
                            Founded in 2024, <strong>Foode</strong> started with a simple idea:
                            Why should finding good food be hard? We noticed that while there were many options,
                            few combined speed, quality, and a genuine love for culinary arts.
                        </p>
                        <p>
                            We started in a small garage with just 5 restaurant partners. Today, we are proud
                            to serve thousands of hungry customers, connecting them with the finest local chefs
                            and hidden gems in the city.
                        </p>

                        <div className="story-stats">
                            <div className="stat-item">
                                <h3>50+</h3>
                                <span>Restaurants</span>
                            </div>
                            <div className="stat-item">
                                <h3>10k+</h3>
                                <span>Happy Eaters</span>
                            </div>
                            <div className="stat-item">
                                <h3>30min</h3>
                                <span>Avg Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Why Choose Us (Features) */}
            <section className="about-features">
                <div className="features-header">
                    <h2>Why Choose Foode?</h2>
                    <p>We are more than just a delivery app.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="icon-wrapper truck">
                            <Truck size={32} />
                        </div>
                        <h3>Super Fast Delivery</h3>
                        <p>Hungry? We get it. Our fleet is optimized to get hot food to your door in record time.</p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-wrapper leaf">
                            <Utensils size={32} />
                        </div>
                        <h3>Fresh Ingredients</h3>
                        <p>We partner only with restaurants that prioritize fresh, locally sourced ingredients.</p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-wrapper heart">
                            <Heart size={32} />
                        </div>
                        <h3>Made with Love</h3>
                        <p>Every dish is prepared with care. If you aren't 100% satisfied, we make it right.</p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-wrapper award">
                            <Award size={32} />
                        </div>
                        <h3>Best Quality</h3>
                        <p>Our quality assurance team regularly tastes and reviews our partners' menus.</p>
                    </div>
                </div>
            </section>

            {/* 4. Team / Values Section */}
            <section className="about-values">
                <div className="values-content">
                    <Smile size={48} color="#ff6b6b" />
                    <h2>"Good food is the foundation of genuine happiness."</h2>
                    <p>- Auguste Escoffier</p>
                </div>
            </section>

            {/* 5. Call to Action */}
            <div className="about-cta">
                <h2>Ready to taste the difference?</h2>
                <button onClick={() => navigate('/customerDashboard')} className="cta-button">
                    Order Now
                </button>
            </div>

            <footer className="simple-footer">
                <p>&copy; 2024 Foode Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}