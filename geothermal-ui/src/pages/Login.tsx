import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Button, Container } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const formFields = {
  signIn: {
    username: {
      placeholder: 'Enter Your Username OR Email',
      isRequired: true,
      label: 'Email / Username'
    },
  }
}

export default function Login() {
  const { authStatus, isPending, user } = useAuthenticator((context) => [context.authStatus, context.isPending])
  const navigate = useNavigate();

  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      navigate('/admin')
    }
  }, [authStatus, user, navigate])

  return (
    <>
      <Container
        sx={{
          margin: '2rem 1rem'
        }}
      >
        <Button
          size="large"
          variant="outlined"
          disabled={isPending}
          onClick={() => navigate('/')}
        >
          Back
        </Button>
      </Container>
      <Container
        sx={{
          marginTop: '15rem'
        }}
      >
        <Authenticator formFields={formFields} hideSignUp={true} />
      </Container>
    </>
  )
}