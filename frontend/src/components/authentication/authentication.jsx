import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import "./authentication.css";

import { motion } from "framer-motion";

import PasswordStrengthBar from 'react-password-strength-bar';

// https://passwordpolicies.cs.princeton.edu/
/*
    Blocklists
        - Check users' passwords against lists of leaked and easily-guessed passwords and block those
    Strength meters and minimum strength requirements
    Composition policies: 
        - Do not require specific character classes; let users freely construct passwords
        - Do set a minimum-length of at least 8 characters.
*/

// https://codesandbox.io/p/sandbox/framer-motion-react-wavy-letter-text-animation-j69kkr?file=%2Fsrc%2FWavyText.tsx%3A5%2C16
/*Separate to possibly be used elsewhere, probably gonna rename some parts and animate the input*/
const AuthenticationInput = ({ value, placeholder, onChange, type="text" }) => {
    return (
        <motion.input
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className={"auth-input"}
            type={type}
        />
    );
}

const AuthenticationPlaceholder = ({ value, placeholder }) => {
    const letters = Array.from(placeholder);

    return (
        <motion.div className="auth-placeholder-overlay">
            {letters.map((letter, index) => (
                <motion.span
                    key={index}
                    animate={value.length === 0 ? "visible" : "hidden"}
                    variants={
                        {
                            visible: (index) => ({
                                y: [0, -5, 0, 10, 0],
                                transition: {
                                    repeat: Infinity,
                                    duration: 2,
                                    delay: index * 0.1
                                }
                            }),
                            hidden: {
                                opacity: 0,
                                transition: { duration: 0.25 }
                            }
                        }
                    }
                >
                    {letter}
                </motion.span>
            ))}
        </motion.div>
    );
};

const AuthenticationInputContainer = ({ value, placeholder, onChange, className, type ="text", error }) => {
    return (
        <div className="auth-input-container">
            <AuthenticationInput
                value={value}
                placeholder=""
                onChange={onChange}
                className={className}
                type={type}
            />
            <AuthenticationPlaceholder value={value} placeholder={placeholder} />
            <label className="auth-error-label">{error}</label>
        </div>
    );
};

const AuthenticationButton = ({ value, onClick, className }) => {
    return (
        <motion.button
            onClick={ onClick }
            className={ className }
            whileHover = {{ scale: 1.1 }}
            whileTap = {{ scale: 0.9 }}
        >{ value }</motion.button>
    );
}

const Authentication = (props) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const [passwordStrengthScore, setPasswordStrengthScore] = useState(0)

    const onRegisterButtonClick = async () => {
        if (!onCheckValidInput()) {
            return;
        }
        
        if (!IsValidRegistrationData()) {
            return;
        }

        alert('On register button click');
    }

    const onLoginButtonClick = async () => {
        if (!onCheckValidInput()) {
            return;
        }

        alert('On login button click');
    }

    const onCheckValidInput = () => {
        // Set initial error values to empty
        setUsernameError('')
        setPasswordError('')

        // Check if the user has entered both fields correctly
        if ('' === username) {
            setUsernameError('Please enter your username.')
            return false;
        }

        if ('' === password) {
            setPasswordError('Please enter a password.')
            return false;
        }

        return true;
    }

    const IsValidRegistrationData = () => {
        const username_requirements = "^[A-Za-z0-9-._@+]+$";

        if (!username.match(username_requirements)) {
            setUsernameError("Invalid usernames: A-Z, a-z, digits, and -, ., _, @, + only");
            return false;
        }

        // Best practices are minimum length and minimum strength
        if (password.length < 12) {
            setPasswordError('12 characters minimum.')
            return false;
        }

        if (passwordStrengthScore < 2) {
            setPasswordError("Password is too weak.")
            return false;
        }

        return true;
    }

    return <div className={"auth-container"}>
        <div className={"auth-branding-container"}>
        </div>
        <Tabs defaultActiveKey="login" variant="tabs" justify>
            <Tab eventKey="login" title="LOGIN">
                <div className={"auth-form-container"}>
                    <AuthenticationInputContainer value={username} placeholder="Username" onChange={ev => setUsername(ev.target.value)} error={usernameError} />                     
                    <AuthenticationInputContainer value={password} placeholder="Password" onChange={ev => setPassword(ev.target.value)} type={"password"} error={passwordError} />
                </div>
                <div className={"auth-actions-container"}>
                    <AuthenticationButton value={"LOG IN"} onClick={onLoginButtonClick} className={"auth-btn"} />
                </div>
            </Tab>
            <Tab eventKey="register" title="REGISTER">
                <div className={"auth-form-container"}>
                    <AuthenticationInputContainer value={username} placeholder="Username" onChange={ev => setUsername(ev.target.value)} error={usernameError} />
                    <AuthenticationInputContainer value={password} placeholder="Password" onChange={ev => setPassword(ev.target.value)} type={"password"} error={passwordError}/>

                    <PasswordStrengthBar minLength={12} password={password} onChangeScore={(score, feedback) => {
                        setPasswordStrengthScore(score);
                    }}/>
                </div>
                <div className={"auth-actions-container"}>
                    <AuthenticationButton value={"REGISTER"} onClick={onRegisterButtonClick} className={"auth-btn"}/>
                </div>
            </Tab>
        </Tabs>
    </div>
}

export default Authentication;