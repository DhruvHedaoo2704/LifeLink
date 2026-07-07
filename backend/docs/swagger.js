import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LifeLink REST API Documentation',
      version: '1.0.0',
      description: 'Enterprise-grade, secure REST APIs for LifeLink - emergency blood donation platform.',
      contact: {
        name: 'LifeLink Support',
        email: 'support@lifelink.org'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token here.'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'mobile', 'password', 'bloodGroup'],
          properties: {
            name: { type: 'string', example: 'John Smith' },
            email: { type: 'string', format: 'email', example: 'john.donor@email.com' },
            mobile: { type: 'string', example: '+919876543210' },
            password: { type: 'string', format: 'password', example: 'secret123' },
            bloodGroup: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], example: 'O+' },
            role: { type: 'string', enum: ['donor', 'recipient', 'hospital', 'blood_bank', 'admin'], example: 'donor' }
          }
        },
        BloodRequest: {
          type: 'object',
          required: ['bloodType', 'urgency', 'unitsNeeded', 'hospital', 'address', 'description', 'location'],
          properties: {
            bloodType: { type: 'string', example: 'O+' },
            urgency: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], example: 'high' },
            unitsNeeded: { type: 'number', example: 2 },
            hospital: { type: 'string', example: 'City Hospital' },
            address: { type: 'string', example: '123 Medical St, Metro City' },
            description: { type: 'string', example: 'Emergency surgery required' },
            location: {
              type: 'object',
              properties: {
                lat: { type: 'number', example: 40.7128 },
                lng: { type: 'number', example: -74.0060 }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./backend/routes/*.js', './backend/controllers/*.js'] // Document path
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
