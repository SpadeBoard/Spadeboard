import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

// Wrap Bootstrap in here?
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './authentication.css';

import { motion } from "framer-motion";

import PasswordStrengthBar from 'react-password-strength-bar';

import Cookies from 'js-cookie';

// https://passwordpolicies.cs.princeton.edu/
/*
    Blocklists
        - Check users' passwords against lists of leaked and easily-guessed passwords and block those
    Strength meters and minimum strength requirements
    Composition policies: 
        - Do not require specific character classes; let users freely construct passwords
        - Do set a minimum-length of at least 8 characters.
*/

interface AuthenticationInputProps {
    value: string;
    placeholder: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    className?: string;
    error?: string;
}

interface AuthenticationButtonProps {
    value: string;
    onClick: () => void;
    className?: string;
}

// https://codesandbox.io/p/sandbox/framer-motion-react-wavy-letter-text-animation-j69kkr?file=%2Fsrc%2FWavyText.tsx%3A5%2C16
/*Separate to possibly be used elsewhere, probably gonna rename some parts and animate the input*/
const AuthenticationInput: React.FC<AuthenticationInputProps> = ({ value, placeholder, onChange, type = "text", className, error }) => {
    return (
        <div className="auth-input-container">
            <input 
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                className={"auth-input"}
                type={type}
            />
            <label className="auth-error-label">{error}</label>
        </div>
    );
};


const AuthenticationButton: React.FC<AuthenticationButtonProps> = ({ value, onClick, className }) => {
    return (
        <motion.button
            onClick={onClick}
            className={className}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >{value}</motion.button>
    );
}

const Authentication: React.FC = () => {
    const [hostServerUrl, setHostServerUrl] = useState<string>(import.meta.env.VITE_HOST_SERVER_URL || 'http://localhost:8000');

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [usernameError, setUsernameError] = useState<string>("")
    const [passwordError, setPasswordError] = useState<string>("")

    const [passwordStrengthScore, setPasswordStrengthScore] = useState<number>(0)

    const navigate = useNavigate();

    const onRegisterButtonClick = async (): Promise<void> => {
        if (!onCheckValidInput()) {
            return;
        }

        if (!isValidRegistrationData()) {
            return;
        }

        // Gonna figure out how to modify this later, route shouldn't have to be localhost:8000
        const response: void = await fetch(`${hostServerUrl}/api/register/`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({
                username: username,
                password: password
            }),
        })
            .then(
                function (res) {
                    return res.json();
                }
            )
            .then(data => {
                // let loginData = JSON.stringify(data);

                // Set cookies
                Cookies.set('access_token', data.access_token);
                Cookies.set('refresh_token', data.refresh_token);

                // Additional logic after setting cookies
                console.log(data);
                console.log("Access token: " + data.access_token + "\nRefresh token: " + data.refresh_token);

                navigate('/');
            })
            .catch(err => alert(err));

        alert('On register button click');
    }

    const onLoginButtonClick = async (): Promise<void> => {
        if (!onCheckValidInput()) {
            return;
        }

        // Gonna figure out how to modify this later, route shouldn't have to be localhost:8000
        const response: void = await fetch(`${hostServerUrl}/api/login/`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({
                username: username,
                password: password
            }),
        })
            .then(
                function (res) {
                    return res.json();
                }
            )
            .then(data => {
                // let loginData = JSON.stringify(data);

                // Set cookies
                Cookies.set('access_token', data.access_token);
                Cookies.set('refresh_token', data.refresh_token);

                // Additional logic after setting cookies
                console.log(data);
                console.log("Access token: " + data.access_token + "\nRefresh token: " + data.refresh_token);

                navigate('/');
            })
            .catch(err => alert(err));
    }

    const onCheckValidInput = (): boolean => {
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

    const isValidRegistrationData = (): boolean => {
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
            <input value = {hostServerUrl} onChange = {ev => setHostServerUrl(ev.target.value)}/>
        </div>
        <Tabs defaultActiveKey="login" variant="tabs" justify>
            <Tab eventKey="login" title="LOGIN">
                <div className={"auth-form-container"}>
                    <AuthenticationInput value={username} placeholder="Username" onChange={ev => setUsername(ev.target.value)} error={usernameError} />
                    <AuthenticationInput value={password} placeholder="Password" onChange={ev => setPassword(ev.target.value)} type={"password"} error={passwordError} />
                </div>
                <div className={"auth-actions-container"}>
                    <AuthenticationButton value={"LOG IN"} onClick={onLoginButtonClick} className={"auth-btn"} />
                </div>
            </Tab>
            <Tab eventKey="register" title="REGISTER">
                <div className={"auth-form-container"}>
                    <AuthenticationInput value={username} placeholder="Username" onChange={ev => setUsername(ev.target.value)} error={usernameError} />
                    <AuthenticationInput value={password} placeholder="Password" onChange={ev => setPassword(ev.target.value)} type={"password"} error={passwordError} />

                    <PasswordStrengthBar minLength={12} password={password} onChangeScore={(score, feedback) => {
                        setPasswordStrengthScore(score);
                    }} />
                </div>
                <div className={"auth-actions-container"}>
                    <AuthenticationButton value={"REGISTER"} onClick={onRegisterButtonClick} className={"auth-btn"} />
                </div>
            </Tab>
        </Tabs>
    </div>
}

export default Authentication;