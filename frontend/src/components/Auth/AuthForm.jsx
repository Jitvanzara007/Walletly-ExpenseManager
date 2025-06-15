import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    InputAdornment,
    IconButton,
    useTheme,
    alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff, Person, Email, Lock } from '@mui/icons-material';

const StyledContainer = styled(Container)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
    padding: theme.spacing(2),
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        animation: 'pulse 15s infinite',
    },
    '@keyframes pulse': {
        '0%': { transform: 'translate(-50%, -50%) scale(1)' },
        '50%': { transform: 'translate(-50%, -50%) scale(1.2)' },
        '100%': { transform: 'translate(-50%, -50%) scale(1)' },
    },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '450px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
    },
}));

const StyledForm = styled('form')(({ theme }) => ({
    width: '100%',
    marginTop: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(1.5),
    borderRadius: '12px',
    textTransform: 'none',
    fontSize: '1.1rem',
    fontWeight: 600,
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
    },
    transition: 'all 0.3s ease',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
        },
        '&.Mui-focused': {
            backgroundColor: alpha(theme.palette.background.paper, 1),
            boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)',
        },
    },
    '& .MuiInputLabel-root': {
        color: theme.palette.text.secondary,
    },
    marginBottom: theme.spacing(2),
}));

const AuthForm = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const validateForm = () => {
        if (!isLogin) {
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters long');
                return false;
            }
            if (formData.password !== formData.password2) {
                setError('Passwords do not match');
                return false;
            }
            if (!formData.email.includes('@')) {
                setError('Please enter a valid email address');
                return false;
            }
        }
        return true;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                const response = await axios.post('http://localhost:8000/api/auth/login/', {
                    username: formData.username,
                    password: formData.password,
                });
                localStorage.setItem('token', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
                navigate('/dashboard');
            } else {
                const registerData = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    password2: formData.password2
                };

                const response = await axios.post('http://localhost:8000/api/auth/register/', registerData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('refreshToken', response.data.refresh);
                    navigate('/dashboard');
                } else {
                    setError('Registration successful! Please log in.');
                    setIsLogin(true);
                }
            }
        } catch (err) {
            console.error('Auth error:', err.response?.data);
            if (err.response?.status === 0) {
                setError('Unable to connect to the server. Please check if the backend server is running.');
            } else if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.response?.data?.non_field_errors) {
                setError(err.response.data.non_field_errors[0]);
            } else if (err.response?.data?.username) {
                setError('Username: ' + err.response.data.username[0]);
            } else if (err.response?.data?.email) {
                setError('Email: ' + err.response.data.email[0]);
            } else if (err.response?.data?.password) {
                setError('Password: ' + err.response.data.password[0]);
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledContainer>
            <StyledPaper elevation={3}>
                <Typography 
                    component="h1" 
                    variant="h4" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 3
                    }}
                >
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </Typography>

                <Tabs 
                    value={isLogin ? 0 : 1}
                    onChange={(e, newValue) => setIsLogin(newValue === 0)}
                    centered 
                    sx={{ 
                        width: '100%', 
                        mb: 3,
                        '& .MuiTab-root': {
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            minWidth: 120,
                        },
                        '& .Mui-selected': {
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                        },
                    }}
                >
                    <Tab label="Login" />
                    <Tab label="Sign Up" />
                </Tabs>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            width: '100%', 
                            mb: 2, 
                            borderRadius: '12px',
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            color: theme.palette.error.main,
                            '& .MuiAlert-icon': {
                                color: theme.palette.error.main,
                            },
                        }}
                    >
                        {error}
                    </Alert>
                )}

                <StyledForm onSubmit={handleSubmit}>
                    <StyledTextField
                        variant="outlined"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={formData.username}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Person color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {!isLogin && (
                        <StyledTextField
                            variant="outlined"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}

                    <StyledTextField
                        variant="outlined"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {!isLogin && (
                        <StyledTextField
                            variant="outlined"
                            required
                            fullWidth
                            name="password2"
                            label="Confirm Password"
                            type={showPassword2 ? 'text' : 'password'}
                            id="password2"
                            value={formData.password2}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword2(!showPassword2)}
                                            edge="end"
                                        >
                                            {showPassword2 ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}

                    <StyledButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </StyledButton>
                </StyledForm>
            </StyledPaper>
        </StyledContainer>
    );
};

export default AuthForm;