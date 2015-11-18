define({
    'TestCenter' : {
        'actions' : {
            'index' : 'controller/TestCenter/index',
            'testCenter' : 'controller/TestCenter/testCenter'
        }
    },
    'Diagnostic' : {
        'actions' : {
            'index' : 'controller/Diagnostic/index'
        }
    },
    'Reporting' : {
        'actions' : {
            'index' : 'controller/Reporting/index'
        }
    },
    'Delivery' : {
        'actions' : {
            'index' : 'controller/Delivery/index',
            'manage' : 'controller/Delivery/manage',
            'monitoring' : 'controller/Delivery/monitoring',
            'monitoringAll' : 'controller/Delivery/monitoring',
            'testTakers' : 'controller/Delivery/testTakers'
        }
    },
    'DeliveryServer' : {
        'actions' : {
            'awaitingAuthorization' : 'controller/DeliveryServer/awaiting'
        }
    }
});
