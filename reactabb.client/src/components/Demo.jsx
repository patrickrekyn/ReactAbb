// eslint-disable-next-line no-unused-vars
import * as React from 'react';
import { extendTheme, styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddLocationTwoToneIcon from '@mui/icons-material/AddLocationTwoTone';
import LayersIcon from '@mui/icons-material/Layers';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Container, Grid } from '@mui/material';
import Utilisateur from './Utilisateur'; // Importer le composant Orders
import DashboardContent from './DashboardContent'; // Importer le composant DashboardContent
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import { ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import AddLocationAltTwoToneIcon from '@mui/icons-material/AddLocationAltTwoTone';
import AgenceMap from './AgenceMap';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const NAVIGATION = [
    {
        kind: 'header',
        title: 'Menu',
    },
    {
        segment: 'dashboard',
        title: 'Dashboard',
        icon: <DashboardIcon />,
    },
    {
        segment: 'utilisateurs',
        title: 'Utilisateurs',
        icon: <AddLocationTwoToneIcon />,
    },
    {
        segment: 'agences',
        title: 'Nos Agences',
        icon: <AddLocationAltTwoToneIcon />,
    },
    {
        kind: 'divider',
    },
    {
        kind: 'header',
        title: 'Analytics',
    },
    {
        segment: 'integrations',
        title: 'Integrations',
        icon: <LayersIcon />,
    },
];

const demoTheme = extendTheme({
    colorSchemes: { light: true, dark: true },
    colorSchemeSelector: 'class',
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
});

function ToolbarActionsSearch() {
    return (
        <Stack direction="row">
            <Tooltip title="Search" enterDelay={1000}>
                <div>
                    <IconButton
                        type="button"
                        aria-label="search"
                        sx={{
                            display: { xs: 'inline', md: 'none' },
                        }}
                    >
                        <SearchIcon />
                    </IconButton>
                </div>
            </Tooltip>
            <TextField
                label="Search"
                variant="outlined"
                size="small"
                slotProps={{
                    input: {
                        endAdornment: (
                            <IconButton type="button" aria-label="search" size="small">
                                <SearchIcon />
                            </IconButton>
                        ),
                        sx: { pr: 0.5 },
                    },
                }}
                sx={{ display: { xs: 'none', md: 'inline-block' }, mr: 1 }}
            />
            <ThemeSwitcher />
        </Stack>
    );
}

function CustomAppTitle() {
    return (
        <Stack direction="row" alignItems="center" spacing={2}>
            <CloudCircleIcon fontSize="large" color="primary" />
            <Typography variant="h6">Caisse d épargne Madagascar</Typography>
            <Chip size="small" label="BETA" color="info" />
            <Tooltip title="Connected to production">
                <CheckCircleIcon color="success" fontSize="small" />
            </Tooltip>
        </Stack>
    );
}

const Skeleton = styled('div')(({ theme, height }) => ({
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    height,
    content: '" "',
}));

export default function DashboardLayoutBasic(props) {
    // eslint-disable-next-line react/prop-types
    const { window } = props;
    const router = useDemoRouter('/dashboard');

    // Remove this const when copying and pasting into your project.
    const demoWindow = window ? window() : undefined;
    const navigate = useNavigate();
    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            const userInfo = localStorage.getItem('userInfo');

            // Vérification basique du token
            if (!token || !userInfo) {
                navigate('/login');
                return;
            }

            try {
                // Vérification côté client de l'expiration
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    throw new Error('Token expiré');
                }

                // Vérification côté serveur
                await axios.get('https://localhost:7265/api/oracledata/validate-token', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                navigate('/login');
                console.log('Erreur lors de la validation du token:', error);
            }
        };

        verifyToken();
    }, [navigate]);
    return (
        <AppProvider
            navigation={NAVIGATION}
            router={router}
            theme={demoTheme}
            window={demoWindow}
        >
            <DashboardLayout slots={{
                appTitle: CustomAppTitle,
                toolbarActions: ToolbarActionsSearch,
            }}>
                <Container>
                    {router.pathname === '/dashboard' ? (
                        <DashboardContent /> // Afficher le composant DashboardContent si le segment est "dashboard"
                    ) : router.pathname === '/utilisateurs' ? (
                        <Utilisateur /> // Afficher le composant Orders si le segment est "orders"
                        ) : router.pathname === '/agences' ? (
                            <AgenceMap /> // Afficher le composant Orders si le segment est "orders"
                        ) : (
                        <Grid container spacing={1}>
                            <Grid item xs={5} />
                            <Grid item xs={12}>
                                <Skeleton height={14} />
                            </Grid>
                            <Grid item xs={12}>
                                <Skeleton height={14} />
                            </Grid>
                            <Grid item xs={4}>
                                <Skeleton height={100} />
                            </Grid>
                            <Grid item xs={8}>
                                <Skeleton height={100} />
                            </Grid>

                            <Grid item xs={12}>
                                <Skeleton height={150} />
                            </Grid>
                            <Grid item xs={12}>
                                <Skeleton height={14} />
                            </Grid>

                            <Grid item xs={3}>
                                <Skeleton height={100} />
                            </Grid>
                            <Grid item xs={3}>
                                <Skeleton height={100} />
                            </Grid>
                            <Grid item xs={3}>
                                <Skeleton height={100} />
                            </Grid>
                            <Grid item xs={3}>
                                <Skeleton height={100} />
                            </Grid>
                        </Grid>
                    )}
                </Container>
            </DashboardLayout>
        </AppProvider>
    );
}
