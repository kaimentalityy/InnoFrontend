import React from 'react';
import { User } from '../../shared/types';

export const ProfilePage: React.FC = () => {
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="container mt-5">
            <div className="card shadow-sm border-0 p-4">
                <h2 className="text-primary mb-4">User Profile</h2>
                <div className="row">
                    <div className="col-md-6">
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                    </div>
                    <div className="col-md-6">
                        <p><strong>First Name:</strong> {user.name}</p>
                        <p><strong>Surname:</strong> {user.surname}</p>
                        <p><strong>Birth Date:</strong> {user.birthDate}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
