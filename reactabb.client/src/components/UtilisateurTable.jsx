import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    CssBaseline
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Container, Table } from 'react-bootstrap';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: `-${drawerWidth}px`,
        ...(open && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        }),
    }),
);

function UtilisateurTable() {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('https://localhost:7265/api/OracleData/utilisateurs', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setUtilisateurs(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des utilisateurs:', error);
                window.location.href = '/';
            });
    }, []);

    const handleDrawerOpen = () => setOpen(true);
    // eslint-disable-next-line no-unused-vars
    const handleDrawerClose = () => setOpen(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <div style={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Tableau de bord
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <Toolbar />
                <List>
                    <ListItem button>
                        <ListItemIcon>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItem>
                    <ListItem button selected>
                        <ListItemIcon>
                            <PeopleAltIcon />
                        </ListItemIcon>
                        <ListItemText primary="Utilisateurs" />
                    </ListItem>
                    <ListItem button onClick={handleLogout}>
                        <ListItemIcon>
                            <ExitToAppIcon />
                        </ListItemIcon>
                        <ListItemText primary="Déconnexion" />
                    </ListItem>
                </List>
            </Drawer>

            <Main open={open}>
                <Toolbar />
                <Container fluid>
                    {loading ? (
                        <div className="text-center mt-5">
                            <CircularProgress />
                        </div>
                    ) : (
                        <Table striped hover responsive className="mt-4">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>Mot de passe</th>
                                </tr>
                            </thead>
                            <tbody>
                                {utilisateurs.map(utilisateur => (
                                    <tr key={utilisateur.id}>
                                        <td>{utilisateur.id}</td>
                                        <td>{utilisateur.email}</td>
                                        <td>{utilisateur.password}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Container>
            </Main>
        </div>
    );
}

export default UtilisateurTable;
































/*import { useState, useEffect } from 'react';
import axios from 'axios';

function UtilisateurTable() {
    const [utilisateurs, setUtilisateurs] = useState([]);
    //const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('https://localhost:7265/api/OracleData/utilisateurs', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => response.data)
            .then(data => {
                setUtilisateurs(data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des utilisateurs:', error);
                window.location.href = '/'; // Rediriger vers la page de connexion en cas d'erreur
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <div>
            <button onClick={handleLogout} style={{ float: 'right', margin: '10px' }}>
                Déconnexion
            </button>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Mot de passe</th>
                    </tr>
                </thead>
                <tbody>
                    {utilisateurs.map(utilisateur => (
                        <tr key={utilisateur.id}>
                            <td>{utilisateur.id}</td>
                            <td>{utilisateur.email}</td>
                            <td>{utilisateur.password}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UtilisateurTable;*/