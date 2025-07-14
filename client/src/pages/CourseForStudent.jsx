import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Spin, 
  message, 
  Row, 
  Col, 
  Button, 
  Divider,
  Tag,
  Space,
  Image,
  List,
  Avatar,
  Collapse,
  Rate,
  Statistic
} from 'antd';
import {
  PlayCircleOutlined,
  FileTextOutlined,
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  StarOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import axios from "../services/axios"

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const Course = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      // Fixed the axios response handling
      const response = await axios.get(`/courses/${id}`);
      setCourse(response.data);
      if (response.data.videos && response.data.videos.length > 0) {
        setSelectedVideo(response.data.videos[0]);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      message.error('Error fetching course details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVideoTitle = (videoUrl, index) => {
    // Extract filename from URL or use generic title
    const filename = videoUrl.split('/').pop().split('.')[0];
    return `Lecture ${index + 1}`;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: '20px' }}>
        <Title level={2}>Course not found</Title>
        <Text>The course you're looking for doesn't exist.</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Course Header */}
        <Card 
          style={{ 
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none'
          }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={8}>
              <Image
                src={course.image}
                alt={course.title}
                style={{ 
                  width: '100%', 
                  borderRadius: '8px',
                  maxHeight: '200px',
                  objectFit: 'cover'
                }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            </Col>
            <Col xs={24} md={16}>
              <div style={{ color: 'white' }}>
                <Title level={1} style={{ color: 'white', marginBottom: '10px' }}>
                  {course.title}
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                  {course.description}
                </Paragraph>
                <Space size="large" wrap>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BookOutlined style={{ marginRight: '8px' }} />
                    <Text style={{ color: 'white' }}>{course.category}</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarOutlined style={{ marginRight: '8px' }} />
                    <Text style={{ color: 'white' }}>{formatDate(course.createdAt)}</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PlayCircleOutlined style={{ marginRight: '8px' }} />
                    <Text style={{ color: 'white' }}>{course.videos.length} Lectures</Text>
                  </div>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            {/* Video Player Section */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PlayCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Course Videos
                </div>
              }
              style={{ marginBottom: '20px' }}
            >
              {selectedVideo && (
                <div style={{ marginBottom: '20px' }}>
                  <video
                    controls
                    style={{ width: '100%', borderRadius: '8px' }}
                    src={selectedVideo}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              
              {/* Video List */}
              <List
                size="small"
                dataSource={course.videos}
                renderItem={(video, index) => (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      padding: '12px',
                      backgroundColor: selectedVideo === video ? '#f0f8ff' : 'white',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: selectedVideo === video ? '2px solid #1890ff' : '1px solid #f0f0f0'
                    }}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<PlayCircleOutlined />} />}
                      title={getVideoTitle(video, index)}
                      description={`Video ${index + 1}`}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* Course Description */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <BookOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  About This Course
                </div>
              }
              style={{ marginBottom: '20px' }}
            >
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {course.description}
              </Paragraph>
              
              <Divider />
              
              <Title level={4}>What You'll Learn</Title>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Comprehensive understanding of {course.category}</li>
                <li>Practical skills through hands-on exercises</li>
                <li>Real-world applications and examples</li>
                <li>Expert guidance from industry professionals</li>
              </ul>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Course Stats */}
            <Card style={{ marginBottom: '20px' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic 
                    title="Price" 
                    value={course.price === 0 ? 'Free' : `₹${course.price}`}
                    valueStyle={{ color: course.price === 0 ? '#52c41a' : '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Videos" 
                    value={course.videos.length}
                    prefix={<PlayCircleOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            {/* Course Materials */}
            <Card 
              title="Course Materials"
              style={{ marginBottom: '20px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {course.pdf && (
                  <Button 
                    type="primary" 
                    icon={<FileTextOutlined />} 
                    block
                    href={course.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Course PDF
                  </Button>
                )}
                
                <Button 
                  type="default" 
                  icon={<DownloadOutlined />} 
                  block
                  onClick={() => message.info('Feature coming soon!')}
                >
                  Download All Materials
                </Button>
              </Space>
            </Card>

            {/* Course Info */}
            <Card title="Course Information">
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Category: </Text>
                <Tag color="blue">{course.category}</Tag>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Created: </Text>
                <Text>{formatDate(course.createdAt)}</Text>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Total Videos: </Text>
                <Text>{course.videos.length}</Text>
              </div>
              
              <div>
                <Text strong>Reviews: </Text>
                <Text>{course.reviews.length} reviews</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Course;