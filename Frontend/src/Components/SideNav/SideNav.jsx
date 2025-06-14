import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './SideNav.css';

const markdown = `

## AIComicX

**Transform Your Stories into Stunning Comics with AI! 🎨🤖**

[![Issues](https://img.shields.io/github/issues/XBastille/AIComicX?color=0088ff)](https://github.com/XBastille/AIComicX/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/XBastille/AIComicX?color=0088ff)](https://github.com/XBastille/AIComicX/pulls)
[![Stars](https://img.shields.io/github/stars/XBastille/AIComicX?style=social)](https://github.com/XBastille/AIComicX/stargazers)

---

# 🚀 PROJECT IN PROGRESS! 🎉

AIComicX is an AI-powered platform that allows users to upload their stories and automatically turn them into comics. Users can either submit their own stories or generate new ones using AI. With multiple comic styles to choose from, AIComicX aims to revolutionize comic creation. 📚✨

## 🌟 Features (Work in Progress)

- 📜 **Story Upload & Comic Generation**: Upload a story and let AI turn it into a beautiful comic.
- ✍ **AI Story Generation**: Generate engaging storylines with AI-powered assistance.
- 🎨 **Multiple Comic Styles**: Choose from a variety of unique comic art styles.
- 🖌 **AI-Powered Character & Scene Design**: Effortlessly create characters and backgrounds.
- 💬 **AI-Assisted Dialogues**: Generate story-based dialogues for seamless storytelling.

## 📌 Status

AIComicX is currently under active development. 🚧 New features are continuously being integrated, and improvements are ongoing. Stay tuned for updates! 🔧✨

## 📞 Contact

📧 For inquiries or feedback, reach out at [eziopuhan825@gmail.com](mailto:eziopuhan825@gmail.com)

---

Thank you for your interest in AIComicX! Stay tuned for exciting updates. 🚀📚

`;

function SideNav() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleNav = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`side-nav ${isOpen ? 'open' : ''}`}>
            <div className="side-nav-content">
                <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
            <button className="toggle-btn" onClick={toggleNav}>
                {isOpen ? '←' : '→'}
            </button>
        </div>
    );
}

export default SideNav;