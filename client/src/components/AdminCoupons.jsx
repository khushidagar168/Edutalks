import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  DatePicker,
  InputNumber,
  Modal,
  message,
  Tag,
  Popconfirm,
  Space,
} from 'antd';
import axios from '../services/axios';
import dayjs from 'dayjs';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newAmount, setNewAmount] = useState();
  const [newExpiry, setNewExpiry] = useState(null);

  // Fetch all coupons from backend
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/coupons');
      setCoupons(res.data);
    } catch (err) {
      message.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Create new coupon
  const createCoupon = async () => {
    if (!newAmount || !newExpiry) {
      message.error('Please set amount and expiry date!');
      return;
    }
    try {
      await axios.post('/coupons', {
        amount: newAmount,
        expiryDate: newExpiry,
      });
      message.success('Coupon created!');
      setNewAmount();
      setNewExpiry(null);
      fetchCoupons();
    } catch (err) {
      message.error(err.response?.data?.message || 'Error creating coupon');
    }
  };

  // Update expiry date for coupon
  const updateExpiry = async (id, date) => {
    if (!date) return;
    try {
      await axios.patch(`/coupons/${id}/expiry`, {
        expiryDate: date,
      });
      message.success('Expiry updated!');
      fetchCoupons();
    } catch (err) {
      message.error(err.response?.data?.message || 'Error updating expiry');
    }
  };

  // Delete coupon
  const deleteCoupon = async (id) => {
    try {
      await axios.delete(`/coupons/${id}`);
      message.success('Coupon deleted!');
      fetchCoupons();
    } catch (err) {
      message.error(err.response?.data?.message || 'Error deleting coupon');
    }
  };

  const columns = [
    {
      title: 'Coupon Code',
      dataIndex: 'couponCode',
      key: 'couponCode',
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const isExpired = new Date() > new Date(record.expiryDate);
        return isExpired ? (
          <Tag color="red">Expired</Tag>
        ) : (
          <Tag color="green">Active</Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <DatePicker
            onChange={(date) => updateExpiry(record._id, date)}
            placeholder="Update Expiry"
            size="small"
          />
          <Popconfirm
            title="Are you sure to delete this coupon?"
            onConfirm={() => deleteCoupon(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Coupons Management</h1>

      <Space style={{ marginBottom: '1rem' }}>
        <InputNumber
          min={1}
          placeholder="Amount (₹)"
          value={newAmount}
          onChange={setNewAmount}
        />
        <DatePicker
          placeholder="Expiry Date"
          value={newExpiry}
          onChange={setNewExpiry}
        />
        <Button type="primary" onClick={createCoupon}>
          Create Coupon
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={coupons}
        rowKey="_id"
        loading={loading}
        bordered
      />
    </div>
  );
};

export default AdminCoupons;
