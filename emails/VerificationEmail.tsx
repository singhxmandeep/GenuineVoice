import React from 'react';
import { Html, Head, Body, Container, Row, Heading, Text, Preview } from '@react-email/components';

interface VerificationEmailProps {
    username: string;
    otp: string;
}

export default function VerificationEmail({
    username,
    otp
}: VerificationEmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Head>
                <title>Verification Code</title>
            </Head>
            <Body>
                <Container>
                    <Preview>
                        Your verification code is here. Please check below for details.
                    </Preview>
                    <Row>
                        <Heading>Welcome, {username}!</Heading>
                        <Text>
                            Thank you for signing up! Please use the following verification code to complete your registration:
                        </Text>
                        <Text>
                            {otp}
                        </Text>
                        <Text>
                            If you did not request this, please ignore this email.
                        </Text>
                    </Row>
                </Container>
            </Body>
        </Html>
    );
}
