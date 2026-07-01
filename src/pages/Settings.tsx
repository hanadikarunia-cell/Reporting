import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAuth } from '@/context/AuthContext';
import { useColorMode } from '@/context/ThemeContext';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  email: z.string().email(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { mode, toggleColorMode } = useColorMode();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName ?? '',
      email: user?.email ?? '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSaveProfile = (values: ProfileForm) => {
    if (user) updateUser({ ...user, displayName: values.displayName });
  };

  const onChangePassword = () => {
    // Wire up to POST /auth/change-password when available on the API.
    passwordForm.reset();
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Appearance" />
            <Divider />
            <CardContent>
              <FormControlLabel
                control={<Switch checked={mode === 'dark'} onChange={toggleColorMode} />}
                label="Dark mode"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Your theme preference is saved to this browser.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Profile" />
            <Divider />
            <CardContent>
              <Box
                component="form"
                onSubmit={profileForm.handleSubmit(onSaveProfile)}
                noValidate
              >
                <Stack spacing={2}>
                  <TextField
                    label="Display name"
                    fullWidth
                    {...profileForm.register('displayName')}
                    error={!!profileForm.formState.errors.displayName}
                    helperText={profileForm.formState.errors.displayName?.message}
                  />
                  <TextField
                    label="Email"
                    fullWidth
                    disabled
                    {...profileForm.register('email')}
                  />
                  <Box>
                    <Button type="submit" variant="contained">
                      Save Profile
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Change Password" />
            <Divider />
            <CardContent>
              {passwordForm.formState.isSubmitSuccessful && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Password change requested.
                </Alert>
              )}
              <Box
                component="form"
                onSubmit={passwordForm.handleSubmit(onChangePassword)}
                noValidate
              >
                <Stack spacing={2}>
                  <TextField
                    label="Current password"
                    type="password"
                    fullWidth
                    {...passwordForm.register('currentPassword')}
                    error={!!passwordForm.formState.errors.currentPassword}
                    helperText={passwordForm.formState.errors.currentPassword?.message}
                  />
                  <TextField
                    label="New password"
                    type="password"
                    fullWidth
                    {...passwordForm.register('newPassword')}
                    error={!!passwordForm.formState.errors.newPassword}
                    helperText={passwordForm.formState.errors.newPassword?.message}
                  />
                  <TextField
                    label="Confirm new password"
                    type="password"
                    fullWidth
                    {...passwordForm.register('confirmPassword')}
                    error={!!passwordForm.formState.errors.confirmPassword}
                    helperText={passwordForm.formState.errors.confirmPassword?.message}
                  />
                  <Box>
                    <Button type="submit" variant="contained">
                      Update Password
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
