import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h1" color="primary" fontWeight={800}>
        404
      </Typography>
      <Typography variant="h6">Page not found</Typography>
      <Typography variant="body2" color="text.secondary">
        The page you are looking for doesn&apos;t exist or has been moved.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Back to Dashboard
      </Button>
    </Box>
  );
}
