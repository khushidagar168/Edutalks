import React, { useState, useEffect } from 'react';
import { Card, Typography, Input, Button, message, Space, Divider, Badge, Row, Col } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, GiftOutlined } from '@ant-design/icons';
import axios from '../services/axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Subscription = () => {
  const [user, setUser] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Load user from localStorage & check expiry
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        // ✅ Check if subscription_upto is expired
        if (parsedUser.subscription_upto && new Date(parsedUser.subscription_upto) < new Date()) {
          parsedUser.subscription_type = 'expired';
        }

        setUser(parsedUser);
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
      }
    }
  }, []);

  const subscriptionEnds = user?.subscription_upto
    ? dayjs(user.subscription_upto).format('DD MMM YYYY, hh:mm A')
    : 'Not active';

  const handleRedeem = async () => {
    if (!couponCode) {
      message.error('Please enter a coupon code!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/subscribe/redeem', {
        couponCode: couponCode.trim(),
      });
      message.success(res.data.message || 'Coupon redeemed successfully!');
      
      // window.location.reload();
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.message || 'Failed to redeem coupon. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card
        bordered={false}
        style={{ background: '#fffbe6', borderRadius: 8, maxWidth: 600, margin: '2rem auto' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Title level={4} style={{ marginBottom: 0 }}>Subscription Status</Title>
        <Divider />
        <Text type="secondary">Please login to view your subscription details.</Text>
      </Card>
    );
  }

  return (
    <Card
      style={{ maxWidth: 600, margin: '2rem auto', borderRadius: 12 }}
      headStyle={{ borderBottom: 0 }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={4} style={{ marginBottom: 0 }}>Subscription Status</Title>

        <Divider style={{ margin: '12px 0' }} />

        <Row gutter={16} align="middle">
          <Col flex="none">
            <Badge
              count={user.subscription_type === 'trial'
                ? <ClockCircleOutlined style={{ color: '#faad14' }} />
                : user.subscription_type === 'subscribed'
                  ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  : <ClockCircleOutlined style={{ color: '#ff4d4f' }} /> // expired style
              }
            />
          </Col>
          <Col flex="auto">
            <Text strong>
              {user.subscription_type === 'trial'
                ? 'Trial Period'
                : user.subscription_type === 'subscribed'
                  ? 'Active Subscription'
                  : 'Subscription Expired'}
            </Text>
            <br />
            <Text type="secondary">
              Valid until: {subscriptionEnds}
            </Text>
          </Col>
        </Row>

        {user.subscription_type === 'trial' && (
          <Card
            bordered={false}
            style={{ background: '#fffbe6', borderRadius: 8 }}
            bodyStyle={{ padding: '12px 16px' }}
          >
            <Space direction="vertical" size={4}>
              <Text strong>
                <GiftOutlined style={{ marginRight: 8 }} />
                You’re currently on a trial plan
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Upgrade with a valid coupon to continue enjoying premium access without interruption.
              </Text>
            </Space>
          </Card>
        )}

        {user.subscription_type === 'expired' && (
          <Card
            bordered={false}
            style={{ background: '#fff1f0', borderRadius: 8 }}
            bodyStyle={{ padding: '12px 16px' }}
          >
            <Space direction="vertical" size={4}>
              <Text strong type="danger">
                ⚠️ Your subscription has expired
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Redeem a coupon to renew your subscription.
              </Text>
            </Space>
          </Card>
        )}

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Redeem Coupon Code</Text>
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            style={{ borderRadius: 6 }}
            allowClear
          />
          <Button
            type="primary"
            onClick={handleRedeem}
            loading={loading}
            disabled={!couponCode}
            block
            style={{ borderRadius: 6 }}
          >
            Apply Coupon
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

export default Subscription;
