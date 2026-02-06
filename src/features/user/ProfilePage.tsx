import React, { useState, useEffect } from 'react';
import { User, UpdateUserRequest } from '../../shared/types';
import { userApi } from './api';

export const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<User>({ username: '', email: '', name: '', surname: '', birthDate: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [formData, setFormData] = useState<User>({ username: '', email: '', name: '', surname: '', birthDate: '' });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const loginData = JSON.parse(localStorage.getItem('user') || '{}') as User;

                let additionalData: Partial<User> = {};
                try {
                    additionalData = await userApi.getProfile();
                } catch (userErr) {
                    console.log('User service not available, error:', userErr);
                }

                const completeUserData = {
                    id: additionalData.id || loginData.id,
                    username: loginData.username || additionalData.username || 'Not available',
                    email: loginData.email || additionalData.email || 'Email not provided',
                    name: additionalData.name || loginData.name || 'Name not provided',
                    surname: additionalData.surname || loginData.surname || 'Surname not provided',
                    birthDate: additionalData.birthDate || loginData.birthDate || 'Birth date not provided',
                    role: additionalData.role || loginData.role || 'ROLE_USER'
                };

                setUser(completeUserData as User);
                setFormData(completeUserData as User);

                const updatedUser = { ...loginData, ...completeUserData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (err: any) {
                console.error('Error setting up profile:', err);

                const fallbackUser = JSON.parse(localStorage.getItem('user') || '{}') as User;
                const completeFallback = {
                    username: fallbackUser.username || 'Not available',
                    email: fallbackUser.email || 'Not available',
                    name: fallbackUser.name || 'Not available',
                    surname: fallbackUser.surname || 'Not available',
                    birthDate: fallbackUser.birthDate || 'Not available',
                    role: fallbackUser.role || 'ROLE_USER'
                };

                setUser(completeFallback);
                setFormData(completeFallback);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setUpdateSuccess('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(user);
        setError('');
        setUpdateSuccess('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setUpdateLoading(true);
        setError('');
        setUpdateSuccess('');

        try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}') as User;
            if (!currentUser.id) {
                throw new Error('User ID not found');
            }

            const updateData: Partial<User> = {};

            if (formData.username !== user.username) updateData.username = formData.username;
            if (formData.email !== user.email) updateData.email = formData.email;
            if (formData.name !== user.name) updateData.name = formData.name;
            if (formData.surname !== user.surname) updateData.surname = formData.surname;
            if (formData.birthDate !== user.birthDate) {
                updateData.birthDate = formData.birthDate;
            }

            const updatedUser = await userApi.updateProfile(currentUser.id, updateData);
            setUser(updatedUser);

            const existingUser = JSON.parse(localStorage.getItem('user') || '{}') as User;
            const updatedLocalStorage = { ...existingUser, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(updatedLocalStorage));

            setUpdateSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(`Failed to update profile: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="card shadow-sm border-0 p-4">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="card shadow-sm border-0 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="text-primary mb-0">User Profile</h2>
                    {!isEditing && (
                        <button className="btn btn-outline-primary" onClick={handleEdit}>
                            Edit Profile
                        </button>
                    )}
                </div>

                {error && (
                    <div className="alert alert-danger mb-4">
                        {error}
                    </div>
                )}

                {updateSuccess && (
                    <div className="alert alert-success mb-4">
                        {updateSuccess}
                    </div>
                )}

                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="surname" className="form-label">Surname</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="surname"
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="birthDate" className="form-label">Birth Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="birthDate"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={updateLoading}
                            >
                                {updateLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Updating...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCancel}
                                disabled={updateLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>Username:</strong> {user.username && user.username !== 'Not available' ? user.username : 'Not available'}</p>
                            <p><strong>Email:</strong> {user.email && user.email !== 'Not available' ? user.email : 'Not available'}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>First Name:</strong> {user.name && user.name !== 'Not available' ? user.name : 'Not available'}</p>
                            <p><strong>Surname:</strong> {user.surname && user.surname !== 'Not available' ? user.surname : 'Not available'}</p>
                            <p><strong>Birth Date:</strong> {user.birthDate && user.birthDate !== 'Not available' ? user.birthDate : 'Not available'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
