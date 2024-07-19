import { useContext } from 'react';
import './header.css'
import logo from '../../assets/webcarros.png'
import { Link } from 'react-router-dom';
import { FiUser, FiLogIn } from 'react-icons/fi';

import { AuthContext } from '../../contexts/AuthContext';

export function Header() {
    const {signed, loadingAuth} = useContext(AuthContext)

    return (
        <div className='header-container'>
            <header>
                <Link to='/'>
                    <img className='logo' src={logo} alt="Logo WebCarros" />
                </Link>

                {!loadingAuth && signed && (
                    <Link to='/dashboard'>
                        <div className='icon-border'>
                            <FiUser size={22} color='#000' />
                        </div>
                    </Link>
                )}

                {!loadingAuth && !signed && (
                    <Link to='/login'>
                        <div className="icon-border">
                            <FiLogIn size={22} color='#000' />
                        </div>
                    </Link>
                )}

            </header>
        </div>
    )
}