import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface MonthlySummaryEmailProps {
  userName?: string;
  month?: string;
  totalExpenses?: string;
  topCategory?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_APP_URL || "https://flowwled.com";

export const MonthlySummaryEmailTemplate = ({
  userName = "Valued User",
  month = "October 2024",
  totalExpenses = "₹45,230",
  topCategory = "Technology",
}: MonthlySummaryEmailProps) => {
  const previewText = `Your Flowled Monthly Summary for ${month} is here`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#fcfcfc] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded-xl my-[40px] mx-auto p-[30px] max-w-[500px] bg-white shadow-sm">
            <Section className="mt-[8px] mb-[32px]">
              <Img
                src={`${baseUrl}/brand/logo-full.png`}
                width="120"
                alt="Flowled"
                className="my-0 mx-auto"
              />
            </Section>

            <Heading className="text-black text-[22px] font-semibold text-center p-0 my-[16px] mx-0 tracking-tight">
              Your {month} Summary
            </Heading>

            <Text className="text-gray-700 text-[15px] leading-[24px] mb-[24px] text-center">
              Hello {userName}, here&apos;s a quick look at your expenses for the month.
            </Text>

            <Section className="bg-[#fafafa] rounded-lg p-6 mb-6 border border-solid border-[#eaeaea]">
              <Row>
                <Column>
                  <Text className="text-[#666] text-[13px] m-0 uppercase tracking-wider font-semibold">
                    Total Spent
                  </Text>
                  <Text className="text-black text-[28px] m-0 font-bold tracking-tight mt-1">
                    {totalExpenses}
                  </Text>
                </Column>
              </Row>
              <Hr className="border border-solid border-[#eaeaea] my-[16px] mx-0 w-full" />
              <Row>
                <Column>
                  <Text className="text-[#666] text-[13px] m-0 uppercase tracking-wider font-semibold">
                    Top Category
                  </Text>
                  <Text className="text-black text-[18px] m-0 font-medium mt-1">
                    {topCategory}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-black rounded-lg text-white text-[14px] font-semibold no-underline text-center px-6 py-3"
                href={`${baseUrl}/dashboard`}
              >
                View Detailed Breakdown
              </Button>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[24px] text-center mb-0">
              Lakhu Teleservices • Flowled App
            </Text>
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center mt-1">
              You&apos;re receiving this email because you opted into monthly summaries.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MonthlySummaryEmailTemplate;
